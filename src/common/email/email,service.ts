import redisServices from "../../DB/redis/redis.services.js";
import type { emailEnum } from "../enums/emailEnum.js";
import { conflictError } from "../exeption/domain.exeption.js";
import { generateOtp } from "../otp/otp.service.js";
import { hashOperation } from "../security/hash.js";
import sendEmail from "./email.config.js";


class mailService {

  private _redisMethod = new redisServices();
  constructor() { }


  async sendOtp({
    email,
    otpType,
    subject
  }: {
    email: string;
    otpType: emailEnum;
    subject: string;
  }) {
    try {

      // 1️⃣ تحقق من OTP موجود مسبقًا
      const prevOtp = await this._redisMethod.ttl(this._redisMethod.getOtpKey({ email, otpType }));
      console.log("Prev OTP TTL:", prevOtp);
      if (prevOtp > 0) {
        throw new conflictError(`You can request new OTP after ${prevOtp} seconds`);
      }

      // 2️⃣ تحقق من بلوك المستخدم إذا وصل للحد
      const isBlocked = await this._redisMethod.exists(this._redisMethod.getOtpBlockedKey({ email, otpType }));
      console.log("Is blocked?", isBlocked);
      if (isBlocked) {
        throw new conflictError("You have reached the maximum number of OTP requests, please try again later");
      }

      // 3️⃣ تحقق عدد المحاولات
      let reqNo = await this._redisMethod.get(this._redisMethod.getOtpReqNoKey({ email, otpType })) || 0;
      reqNo = Number(reqNo);
      console.log("OTP Request No:", reqNo);
      if (Number(reqNo) >= 5) {
        await this._redisMethod.set({
          key: this._redisMethod.getOtpBlockedKey({ email, otpType }),
          value: 1,
          exValue: 10 * 60 // 10 دقائق بلوك
        });
        throw new conflictError("You have reached the maximum number of OTP requests, please try again later");
      }

      // 4️⃣ توليد OTP وإرساله
      const otp = generateOtp();
      console.log("Generated OTP:", otp);

      try {
        await sendEmail({ to: email, subject, html: `<h1>${otp}</h1>` });
      } catch (err) {
        console.error("Email send failed:", err);
        throw new conflictError("Failed to send OTP email");
      }

      // 5️⃣ حفظ OTP في Redis
      await this._redisMethod.set({
        key: this._redisMethod.getOtpKey({ email, otpType }),
        value: await hashOperation({ plainText: otp.toString() }),
        exValue: 120 // صلاحية OTP دقيقتين
      });

      // 6️⃣ زيادة عدد المحاولات
      await this._redisMethod.incr(this._redisMethod.getOtpReqNoKey({ email, otpType }));

      console.log("OTP saved and request count incremented successfully.");

    } catch (err) {
      console.error("sendOtp error:", err);
      throw err;
    }
  }
}
export default new mailService
import type { confirmEmailDto, logInDto, resendForgetPassOtpDto, resetPasswordDto, SignUpDto, verifyOtpForgetPasswordDto } from "./auth.Dto.js"
import { conflictError, notFoundError } from "../../common/exeption/domain.exeption.js";
import { is } from "zod/locales";
import userRebo from "../../DB/Repo/user.Rebo.js";
import type { IHUser, IUser } from "../../DB/models/user.model.js";
import { comareOperation, hashOperation } from "../../common/security/hash.js";
import { encryptionValue } from "../../common/security/encryption.js";
import tokenService from "../../common/security/token.service.js";
import mailService from "../../common/email/email,service.js";
import { emailEnum } from "../../common/enums/emailEnum.js";
import redisServices from "../../DB/redis/redis.services.js";
import { any } from "zod";
import { providerEnum } from "../../common/enums/userEnum.js";
import { GOOGLE_CLIENT_ID } from "../../config/config.service.js";
import { OAuth2Client } from "google-auth-library";
import NotificationService from "../../common/notification/notification.service.js";


class AuthService {
  private _userRepo = userRebo;
  private _tokenService = tokenService;
  private _mailService = mailService;
  private _redisMethod = new redisServices();
  private _notificationService =  new NotificationService();

  //////////////////signUp////////////////////////////////////////////////////////////////////////

  public async signUp(bodyData: SignUpDto) {
    const { email } = bodyData;
    const isEmail = await this._userRepo.findOne({ filter: { email } });

    if (isEmail) {
      throw new conflictError("email already exist");
    }



    const [user] = await this._userRepo.create({ data: [bodyData] });


    return user!;

  }

  //////////////////logIn////////////////////////////////////////////////////////////////////////

  public async logIn(body: logInDto) {
    const { email, password } = body

    const user = await this._userRepo.findOne({ filter: { email } })

    if (!user) {
      throw new notFoundError("invaild data")
    }
    console.log("confirmEmail:", user.confirmEmail);
    if (!user.confirmEmail) {
      throw new conflictError("your email un uthorized")
    }



    const ispassValid = await comareOperation({ plainText: password, hashValue: user.password })

    if (!ispassValid) {
      throw new notFoundError("this pass  wrong")
    }


    if(body.fcmToken){
      await this._redisMethod.addFcmToSet(user._id.toString(), body.fcmToken);

     const tokens=await this._redisMethod.getFcmSetMembers(user._id.toString())
     await this._notificationService.sendNotifications({
      tokens,
      data:{title:"new login",body:"you have new login to your account at "+new Date().toLocaleString()}
     })



    }


    return { status: 201, result: this._tokenService.generateAccessAndRefreshToken(user) };


  }

  //////////////////confirm email////////////////////////////////////////////////////////////////////////

  async confirmEmail(bodyData: confirmEmailDto) {
    const { email, otp } = bodyData;

    const user = await this._userRepo.findOne({
      filter: { email, confirmEmail: false }
    });
    console.log(user);


    if (!user) {
      throw new conflictError("Invalid email or already confirmed");
    }

    const key = this._redisMethod.getOtpKey({
      email,
      otpType: emailEnum.confirmEmail
    });

    const storedOtp = await this._redisMethod.get(key);

    if (!storedOtp) {
      throw new conflictError("OTP expired or invalid");
    }

    const isOtpValid = await comareOperation({
      plainText: otp,
      hashValue: storedOtp,
    });

    if (!isOtpValid) {
      throw new conflictError("OTP is invalid")
    }

    user.confirmEmail = true;
    await user.save();

    await this._redisMethod.del(key);

    return { message: "Email confirmed successfully" };
  }
  //////////////////resendForgetPassOtp////////////////////////////////////////////////////////////////////////
  async resendOtpConfirmEmailOtp(email: string) {
    try {
      // console.log("Resending OTP for:", email);
      // const { email } = databody;
      await this._mailService.sendOtp({
        email,
        otpType: emailEnum.confirmEmail,
        subject: "Again confirm email OTP"
      });
      console.log("OTP sent successfully to:", email);
    } catch (err) {
      console.error("Failed to resend OTP:", err);
      throw err;
    }
  }



  //////////////////forget password////////////////////////////////////////////////////////////////////////
async resendForgetPassOtp(email: string) {
  await this._mailService.sendOtp({
     email,
    otpType: emailEnum.forgetPassword,
    subject: "again reset password otp"
  });
}

async sendOtpForgetPassword({ email }: { email: string }) {console.log(email);

   const user=await this._userRepo.findOne({
   filter:{email}
})
console.log("user for send otp forget password:", user);
if (!user){
  throw new notFoundError("email not found")
}
if(!user.confirmEmail){
  throw new conflictError("confirm your email first")

}

 await this._mailService.sendOtp({email,otpType:emailEnum.forgetPassword,subject:"reset password otp"})


   }


 async  verifyOtpForgetPassword(bodyData:verifyOtpForgetPasswordDto){

 const {email,otp}=bodyData

 const emailOtp=await this._redisMethod.get(this._redisMethod.getOtpKey({email,otpType:emailEnum.forgetPassword}))


 if (!emailOtp){
   throw new conflictError("otp is invalid")
 }

 const isOtpValid=await comareOperation({
      plainText:otp,
      hashValue:emailOtp,  
   })

if (!isOtpValid){ throw new conflictError("otp not  invalid")

}
}

 async  resetPassword(bodyData:resetPasswordDto){

 const {email,otp,password}=bodyData
   await this.verifyOtpForgetPassword({email,otp})

   await this._userRepo.updateOne({filter:{email},update:{password:await hashOperation({plainText:password })}})

return {status:200,msg:"password reset successfully"}
}


async  verifyGoogleToken(idToken:string){
      

const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
return payload
}
//////////////////////////////////////////////verifyGoogleToken////////////////////////////////////////////
 async  loginWithGmail(idToken:string):Promise<{accessToken:string,refreshToken:string}>{
const payload=await this.verifyGoogleToken(idToken)


if (!payload || !payload.email) {
   throw new conflictError( 'invalid Google token' );
}
if(!payload.email_verified){
      throw  new conflictError(  'email is not verified' );
}

   const user = await this._userRepo.findOne({
      filter: { email: payload.email as string,provider:providerEnum.google }
   });

//    if(!user){
//      return await this.signupWithGmail(idToken)
//    }


 
    return  this._tokenService.generateAccessAndRefreshToken(user as IHUser)
   
}

//////////////////////loginWithGmail//////////////////////////////////////////////////////////////

 async signupWithGmail(idToken:string){


   const payloadGoogleToken = await this.verifyGoogleToken(idToken);


   if (!payloadGoogleToken || !payloadGoogleToken.email) {
   throw new conflictError( 'invalid Google token' );
}
   if (!payloadGoogleToken.email_verified){
      throw new conflictError( 'email must be verified' );
   }

   const user = await this._userRepo.findOne({
      filter: { email: payloadGoogleToken.email }
   });

   if (user) {

      if (user.provider === providerEnum.system){
         throw new conflictError('account already exists, login using email & password');
      }

      return {status:200,result:await this.loginWithGmail(idToken)};
   }

   const [newUser] = await this._userRepo.create({
      data:{
         email: payloadGoogleToken.email,
         userName: payloadGoogleToken.name,
         profilePic: payloadGoogleToken.picture,
         confirmEmail:true,
         provider: providerEnum.google,
      }
   });
   return {status: 201,result:this._tokenService.generateAccessAndRefreshToken( newUser! ) };
} 

}
export default new AuthService

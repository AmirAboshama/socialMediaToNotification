import { model, Schema, Types, type HydratedDocument } from "mongoose";
import { genderEnum, providerEnum, roleEnum } from "../../common/enums/userEnum.js";
import { th } from "zod/locales";
import { hashOperation } from "../../common/security/hash.js";
import { encryptionValue } from "../../common/security/encryption.js";
import { emailEnum } from "../../common/enums/emailEnum.js";
import mailService from "../../common/email/email,service.js";



// 1. Create an interface representing a document in MongoDB.
export interface IUser {
    _id: Types.ObjectId; // 👈 ده المهم
    userName: string;
    email: string;
    confirmEmail?: boolean;
    password: string;
    provider: Number | providerEnum;
    age: Number;
    phone?: string;
    gender: Number | genderEnum;
    profilePicture?: string;
    coverPicture?: string;
    role: number | roleEnum;
    changeCredential?: Date
}


export type IHUser = HydratedDocument<IUser>;

// 2. Create a Schema corresponding to the document interface.
const userSchema = new Schema<IUser>({
    userName: { type: String, required: true },
    email: { type: String, required: true },
    confirmEmail: { type: Boolean, default: false },
    password: { type: String, required: function (): boolean { return this.provider == providerEnum.system; } },
    provider: { type: Number, enum: providerEnum, default: providerEnum.system },
    age: Number,
    phone: { type: String, required: false },
    gender: { type: Number, enum: genderEnum, default: genderEnum.male },
    role: { type: Number, enum: roleEnum, default: roleEnum.User },
    changeCredential: Date,
    profilePicture: { type: String },

coverPicture: [String]}, {
    timestamps: true
});

userSchema.pre('save', async function (this: IHUser & { wasNew?: boolean }) {
   this.wasNew = this.isNew;
    if (this.isModified('password')) {
        this.password = await hashOperation({ plainText: this.password });
    }
    if (this.phone && this.isModified('phone')) {
        const encryptionedPhone = this.phone = encryptionValue({ value: this.phone });
        this.phone = encryptionedPhone;

    }
})

userSchema.post('save', async function (this: IHUser & { wasNew?: boolean }) {

        try {
            if (this.wasNew  ) {
          await mailService.sendOtp({
            email : this.email,
            otpType: emailEnum.confirmEmail,
            subject: "Confirm email OTP"
          });}
        } catch (err) {
          console.error("OTP failed:", err);
        }
     
})


// 3. Create a Model.
const userModel = model<IUser>('User', userSchema);

export default userModel;
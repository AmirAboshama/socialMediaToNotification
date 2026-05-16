import type z from "zod";
import type { confirmEmailSchema, loginSchema, resendForgetPassOtpSchema, resendOtpConfirmEmailOtpSchema, resetPasswordSchema, sendMailForgitPassSchema, signUpSchema, verifyOtpForgetPasswordSchema } from "./auth.validation.js";



export type SignUpDto = z.infer<typeof signUpSchema.body>;
export type logInDto = z.infer<typeof loginSchema.body>;
export type confirmEmailDto = z.infer<typeof confirmEmailSchema.body>;
export type resendOtpConfirmEmailOtpDto = z.infer<typeof resendOtpConfirmEmailOtpSchema.body>;


export type resendForgetPassOtpDto =
  z.infer<typeof resendForgetPassOtpSchema.body>;
  
  export type sendMailForgitPassDto = z.infer<typeof sendMailForgitPassSchema.body>;
export type verifyOtpForgetPasswordDto = z.infer<typeof verifyOtpForgetPasswordSchema.body>;
export type resetPasswordDto = z.infer<typeof resetPasswordSchema.body>;

import z, { email } from "zod"
import { commonValidationField } from "../../middleWares/validationMiddleware.js"

//////////loginSchema//////////////////////////////////////////


export const loginSchema = {
    body: z.strictObject({
        email: commonValidationField.email,
        password: commonValidationField.password,
        fcmToken: z.string().optional()

    })
}
//////////signUpSchema//////////////////////////////////////////

export const signUpSchema = {



    body: loginSchema.body.extend({
        userName: commonValidationField.userName,

        confirmPassword: commonValidationField.confirmPassword,
        age: commonValidationField.age,
        phone: commonValidationField.phone.optional(),
        gender: commonValidationField.gender.optional()
    }).refine((data) => data.password === data.confirmPassword, {
        message: "passwords don't match",

    })

}


//////////confirmEmailschema//////////////////////////////////////////

export const confirmEmailSchema = {
    body: z.object({
        email: commonValidationField.email,
        otp: commonValidationField.otp
    })

}


//////////resendOtpConfirmEmailOtpSchema//////////////////////////////////////////

export const resendOtpConfirmEmailOtpSchema = {
 body: z.object({
        email: commonValidationField.email,
    })
}

//////////resendForgetPassOtp//////////////////////////////////////////

export const resendForgetPassOtpSchema = {
  body: z.object({
    email: commonValidationField.email,
  }),
};
export const sendMailForgitPassSchema = {
 body: z.object({
        email: commonValidationField.email,
    })
}
export const verifyOtpForgetPasswordSchema = {
  body: z.object({
    email: commonValidationField.email,
    otp: commonValidationField.otp,
  }),
}
export const resetPasswordSchema = {
  body: z.object({
    email: commonValidationField.email,
    otp: commonValidationField.otp,
    password: commonValidationField.password,
  }),
}
//////////resendForgetPassOtp//////////////////////////////////////////

export const signupWithGmailSchema = {
  body: z.object({
    idToken: z.string()
  }),
}

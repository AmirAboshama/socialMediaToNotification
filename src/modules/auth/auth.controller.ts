import express from "express";
import AuthService from "./auth.service.js";
import succResponse from "../../common/response/succ.response.js";
import type { logInDto, SignUpDto } from "./auth.Dto.js";
import z from "zod";
import { badRequestError } from "../../common/exeption/domain.exeption.js";
import { confirmEmailSchema, loginSchema, resendForgetPassOtpSchema, resendOtpConfirmEmailOtpSchema, resetPasswordSchema, sendMailForgitPassSchema, signUpSchema, signupWithGmailSchema, verifyOtpForgetPasswordSchema } from "./auth.validation.js";
import { validation } from "../../middleWares/validationMiddleware.js";
import { authMiddleware } from "../../middleWares/auth.middleware.js";

const autController = express.Router()

autController.get("/", (req, res) => {
    return succResponse({ res, msg: "auth page" })
})




/////////////////////signUp/////////////////////////////////////////////////////////////////////////////////

autController.post("/signUp",validation(signUpSchema), async (req, res) => {
    
    
    const result = await AuthService.signUp(req.body)
    console.log(result);
    
    return succResponse<any>({ res,msg:"check ur inbox", data: result });
})



/////////////////////logIn/////////////////////////////////////////////////////////////////////////////////
autController.post("/logIn",validation(loginSchema),async (req, res) => {
    const result =  await AuthService.logIn(req.body)
return succResponse<{
  status: number;
  result: { accessToken: string; refreshToken: string };
}>({
  res,
  data: result
});})

//////////////confirmEmail///////////////////////////////////////////////

autController.post('/confirmEmail',validation(confirmEmailSchema),async (req,res)=>{


await AuthService.confirmEmail(req.body)
return succResponse({res,statusCode:201,msg:"ur email confirmed "})

  
})
//////////////resendOtpConfirmEmailOtp///////////////////////////////////////////////

autController.post('/resendOtpConfirmEmailOtp',validation(resendOtpConfirmEmailOtpSchema),async (req,res)=>{
    
    
   await AuthService.resendOtpConfirmEmailOtp(req.body.email)
    return succResponse({res,statusCode:201,data:"check your email for confirm email otp"})
    
    
})

//////////////resendForgetPassOtp///////////////////////////////////////////////

autController.post(
  '/resendForgetPassOtp',
  validation(resendForgetPassOtpSchema),
  async (req, res) => {
    const { email } = req.body;

    await AuthService.resendForgetPassOtp(email);

    return succResponse({
      res,
      statusCode: 201,
      data: "check your email for reset password otp",
    });
  }
);
//////////////sendMailForgitPass///////////////////////////////////////////////

autController.post('/sendMailForgitPass',validation(sendMailForgitPassSchema),async (req,res)=>{


const result =await AuthService.sendOtpForgetPassword(req.body)
return succResponse({res,statusCode:201,data:result,msg:"check your email"})

  
})
//////////////verifyOtpForgetPassword///////////////////////////////////////////////

autController.post('/verifyOtpForgetPassword',validation(verifyOtpForgetPasswordSchema),async (req,res)=>{


const result =await AuthService. verifyOtpForgetPassword(req.body)
return succResponse({res,statusCode:201,data:" verify your otp  email"})

  
})
//////////////resetPassword///////////////////////////////////////////////

autController.post('/resetPassword',validation(resetPasswordSchema),async (req,res)=>{


const result =await AuthService.resetPassword(req.body)
return succResponse({res,statusCode:201,data:" done reset password" })

  
})

///////////////signup/gmail///////////////////////////////////////////////

autController.post('/signup/gmail',validation(signupWithGmailSchema),async (req,res)=>{


const result =await AuthService.signupWithGmail(req.body.idToken)
return succResponse < {
  status: number;
result: { accessToken: string; refreshToken: string }; 
 } > ({res,statusCode:201,data:result,msg:" ur account created successfully "})

  
})



export default autController
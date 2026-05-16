import { signUpSchema } from "../modules/auth/auth.validation.js";
import type  { NextFunction, Request, Response }  from "express";
import { badRequestError } from "../common/exeption/domain.exeption.js";
import z, { ZodType } from "zod";
import { genderEnum } from "../common/enums/userEnum.js";

type keyReqType=keyof Request
export function validation(validationSchema:Partial<Record<keyReqType, ZodType >>) {

    z.object()
    return (req : Request, res : Response, next : NextFunction) => {
        const validationErrors : { path: PropertyKey[], message: string }[] = [];
     for (const key of Object.keys(validationSchema)as keyReqType[]) {


        if (!validationSchema[key]) continue;




        if (key=="body"){
(req as any).files = req.files        }
                const ValidationResult = validationSchema[key].safeParse(req[key])



                if (!ValidationResult.success) {
                validationErrors.push(...ValidationResult.error.issues.map(issue=>{ return { path: issue.path, message: issue.message } }))



                }
        }
    if (validationErrors.length > 0) {
        throw new badRequestError("validation error",{validationErrors})
    }
    next();
}
}


export const  commonValidationField ={
      userName: z.string().min(3,{error:"user canoot unless 3 carr"}).max(20,{error:"user canoot maxim 20 carr"}),
        email: z.string().email(),
        password: z.string().regex(new RegExp(/(?=.*\w)(?=.*\W).{8,16}/m), "password must be 8-16 characters and contain at least one letter and one number"),
        confirmPassword: z.string(),
        age: z.number().positive().optional(),
        phone: z.string().regex(new RegExp(/^(\+201|00201|01)[1,2,0,5][0-9]{8}$/m)),
        gender: z.enum(genderEnum).optional(),
        otp:z.string().regex(new RegExp(/\d{6}/) )
}
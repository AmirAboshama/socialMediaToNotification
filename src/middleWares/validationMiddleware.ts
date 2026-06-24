import { signUpSchema } from "../modules/auth/auth.validation.js";
import type { NextFunction, Request, Response } from "express";
import { badRequestError, MapGQLError } from "../common/exeption/domain.exeption.js";
import z, { ZodType } from "zod";
import { genderEnum } from "../common/enums/userEnum.js";
import { Types } from "mongoose";

type keyReqType = keyof Request
export function validation(validationSchema: Partial<Record<keyReqType, ZodType>>) {

  z.object()
  return (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: { path: PropertyKey[], message: string }[] = [];
    for (const key of Object.keys(validationSchema) as keyReqType[]) {


      if (!validationSchema[key]) continue;




      if (key == "body") {
        (req as any).files = req.files
      }
      const ValidationResult = validationSchema[key].safeParse(req[key])



      if (!ValidationResult.success) {
        validationErrors.push(...ValidationResult.error.issues.map(issue => { return { path: issue.path, message: issue.message } }))



      }
    }
    if (validationErrors.length > 0) {
      throw new badRequestError("validation error", { validationErrors })
    }
    next();
  }
}
export function validationGql<T>(validationSchema: ZodType,
  value: T,
) {

  const ValidationResult = validationSchema.safeParse(value)



  if (!ValidationResult.success) {


    MapGQLError(
      new badRequestError("validation error ", ValidationResult.error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
      })))
    );

  }
}
export function validationSockitIo<T>(validationSchema: ZodType,
  value: T,
) {

  const ValidationResult = validationSchema.safeParse(value)



  if (!ValidationResult.success) {


     throw  new badRequestError("validation error ", ValidationResult.error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
      })))
  

  }
}


export const commonValidationField = {
  objectId: z.string().refine(
    (value) => Types.ObjectId.isValid(value),
    { message: "Invalid ObjectId" }
  ),

  id: z.string().refine((args) => Types.ObjectId.isValid(args), { message: "Invalid ObjectId" }).optional(),
  userName: z.string().min(3, { error: "user canoot unless 3 carr" }).max(20, { error: "user canoot maxim 20 carr" }),
  email: z.string().email(),
  password: z.string().regex(new RegExp(/(?=.*\w)(?=.*\W).{8,16}/m), "password must be 8-16 characters and contain at least one letter and one number"),
  confirmPassword: z.string(),
  age: z.number().positive().optional(),
  phone: z.string().regex(new RegExp(/^(\+201|00201|01)[1,2,0,5][0-9]{8}$/m)),
  gender: z.enum(genderEnum).optional(),
  otp: z.string().regex(new RegExp(/\d{6}/))
}
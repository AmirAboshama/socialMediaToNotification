import type z from "zod";
import type { uploadProfileImageSchema } from "./user.validation.js";



  export type sendMailForgitPassDto = z.infer<typeof uploadProfileImageSchema.body>;

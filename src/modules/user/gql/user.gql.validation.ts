import z from "zod";
import { commonValidationField } from "../../../middleWares/validationMiddleware.js";

export const getProfileScehma = z.object({
  userId: commonValidationField.id,
});
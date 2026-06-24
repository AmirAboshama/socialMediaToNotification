import z from "zod";
import { commonValidationField } from "../../../middleWares/validationMiddleware.js";

export const reactPostScehma = z.object({
  postId: commonValidationField.id,
  react:z.coerce.number(),
});
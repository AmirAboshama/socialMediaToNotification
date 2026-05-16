import type z from "zod";
import type { createPostSchema } from "./posts.validation.js";



  export type createPostSchemaDto = z.infer<typeof createPostSchema.body>;

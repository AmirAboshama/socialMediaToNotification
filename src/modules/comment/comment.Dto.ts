import type z from "zod";
import type { createPostSchema, findPostsSchema, updatePostSchema } from "./comment.validation.js";



  export type createPostSchemaDto = z.infer<typeof createPostSchema.body>;
  export type updatePostSchemaDto = z.infer<typeof updatePostSchema.body>;
  export type findPostsSchemaDto = z.infer<typeof findPostsSchema.query>;

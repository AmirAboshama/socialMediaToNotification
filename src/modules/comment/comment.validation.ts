import z from "zod";
import { postPrivacyEnum } from "../../common/enums/postEnum.js";
import { ar } from "zod/locales";
import { Types } from "mongoose";
import { commonValidationField } from "../../middleWares/validationMiddleware.js";


export const createPostSchema = {
  body: z.object({
    content: z.string().min(3).max(500).optional(),
    files: z.array(z.any()).optional(),
    tags: z.array(z.string()).optional(),
    privacyEnum: z.coerce.number().default(postPrivacyEnum.PUBLIC),
  })
  .superRefine((args, ctx) => {

    // لازم content أو files
    if (!args.content && (!args.files || args.files.length == 0)) {
      ctx.addIssue({
        code: "custom",
        message: "u should add to post content or file",
      });
    }

    // tags validation
    if (args.tags?.length) {

      // check invalid ObjectId
      for (const tag of args.tags) {
        if (!Types.ObjectId.isValid(tag)) {
          ctx.addIssue({
            code: "custom",
            message: `tag ${tag} is not valid id`,
          });
        }
      }

      // unique check (مرة واحدة فقط)
      const uniqueTags = [...new Set(args.tags)];
      if (uniqueTags.length !== args.tags.length) {
        ctx.addIssue({
          code: "custom",
          message: "tags should be unique",
        });
      }
    }
  }),
};
export const updatePostSchema = {
  body: z.object({
    content: z.string().min(3).max(500).optional(),
    files: z.array(z.any()).optional(),
removeFiles: z.array(commonValidationField.objectId).optional(),
tags: z.array(commonValidationField.objectId).optional(),
removeTags: z.array(commonValidationField.objectId).optional(),
    privacyEnum: z.coerce.number().default(postPrivacyEnum.PUBLIC),
  })
  .superRefine((args, ctx) => {


    // tags validation
    if (args.tags?.length) {

      // check invalid ObjectId
      for (const tag of args.tags) {
        if (!Types.ObjectId.isValid(tag)) {
          ctx.addIssue({
            code: "custom",
            message: `tag ${tag} is not valid id`,
          });
        }
      }

      // unique check (مرة واحدة فقط)
      const uniqueTags = [...new Set(args.tags)];
      if (uniqueTags.length !== args.tags.length) {
        ctx.addIssue({
          code: "custom",
          message: "tags should be unique",
        });
      }
    }
  }),
  params:z.object({
    postId: commonValidationField.id
  })
};

export const findPostsSchema = {
  query: z.object({
    page : z.coerce.number().optional(),
    size : z.coerce.number().optional(  ),
    search : z.string().optional()
  })
 
};
export const reactPostsSchema = {
  query: z.object({
    react : z.coerce.number(),
   
  })
 
};

import z from "zod";
import { postPrivacyEnum } from "../../common/enums/postEnum.js";
import { ar } from "zod/locales";
import { Types } from "mongoose";


export const createPostSchema = {
    body: z.object({

        content: z.string().min(3).max(500).optional(),
        files: z.array(z.any()).optional(),
        tags: z.array(z.string()).optional(),
        privacyEnum: z.coerce.number().default(postPrivacyEnum.PUBLIC)
    })
        .superRefine((args, ctx) => {
            if (!args.content && (!args.files || args.files.length === 0)) {
                ctx.addIssue({
                    code: "custom",
                    message: "u should add to post content or file",
                });
            }

            for (const tag of args.tags as string[]) {

                if (Types.ObjectId.isValid(tag)) {
                    ctx.addIssue({
                        code: "custom",
                        message: `tag ${tag} is not valid id`,
                    })
                }

                const uniqueTags = [...new Set(args.tags)];

                if (uniqueTags.length != args.tags?.length) {
                    ctx.addIssue({
                        code: "custom",
                        message: "tags should be unique",
                    })

                }

            }
        })
};

import z from "zod";

export const logoutSchema = {
  body: z.object({
  logOutOption: z.enum(["all", "one"])
  }),
}

export const uploadProfileImageSchema = {
  body: z.object({

  }),
}
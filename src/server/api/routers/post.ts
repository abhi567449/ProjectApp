import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

const textInput = z.object({ text: z.string() });
const nameInput = z.object({ name: z.string().min(1) });

type TextInput = z.infer<typeof textInput>;
type NameInput = z.infer<typeof nameInput>;

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(textInput)
    .query(({ input }: { input: TextInput }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: protectedProcedure
    .input(nameInput)
    .mutation(async ({ ctx, input }: { ctx: any; input: NameInput }) => {
      return ctx.db.post.create({
        data: {
          name: input.name,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  getLatest: protectedProcedure.query(async ({ ctx }: { ctx: any }) => {
    const post = await ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
      where: { createdBy: { id: ctx.session.user.id } },
    });

    return post ?? null;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});

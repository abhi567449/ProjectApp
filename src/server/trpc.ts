import { initTRPC } from '@trpc/server'
import { prisma } from './prisma'

const t = initTRPC.context<{ prisma: typeof prisma }>().create()

export const router = t.router
export const publicProcedure = t.procedure

export const appRouter = router({
  hello: publicProcedure.query(() => 'hello world'),
})

export type AppRouter = typeof appRouter

import { prisma } from './prisma'
import { inferAsyncReturnType } from '@trpc/server'

export const createContext = () => {
  return { prisma }
}

export type Context = inferAsyncReturnType<typeof createContext>

import { createNextApiHandler } from '@trpc/server/adapters/next'
import { appRouter } from '../../../server/trpc'
import { createContext } from '../../../server/context'

export default createNextApiHandler({
  router: appRouter,
  createContext,
})

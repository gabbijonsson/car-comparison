import { query } from './_generated/server'

export const get = query({
  args: {},
  handler: async () => {
    return {
      ok: true as const,
      service: 'car-comparison',
      checkedAt: Date.now(),
    }
  },
})

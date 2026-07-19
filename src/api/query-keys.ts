// Central query-key factory — the single source of truth for cache keys.
export const queryKeys = {
  berries: {
    all: ['berries'] as const,
  },
} as const

/**
 * Isomorphic helper functions that work in both server and client environments
 */

export const isBrowser = typeof window !== 'undefined';

export const isServer = typeof window === 'undefined';


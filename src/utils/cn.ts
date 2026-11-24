/** Tiny className joiner — avoids pulling in a dependency for one helper. */
export const cn = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ')

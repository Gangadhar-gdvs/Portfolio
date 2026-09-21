/**
 * The default resolution of `@/design/entry`, for TypeScript and editors.
 *
 * At build time the alias in next.config.ts replaces this with the entry for
 * the design being built — `entry.stack.tsx` or `entry.south.tsx` — so this
 * file is never the one that ships.
 */
export { DesignHome } from "./entry.stack";

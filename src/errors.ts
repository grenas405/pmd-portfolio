export type NotFoundError = { readonly kind: "NotFound"; readonly path: string };

export type MethodNotAllowedError = { readonly kind: "MethodNotAllowed"; readonly method: string };

export type AppError = NotFoundError | MethodNotAllowedError;

/** Turn an unknown thrown value into a log-safe description (no stack, no request data). */
export const describeError = (cause: unknown): string =>
  cause instanceof Error ? `${cause.name}: ${cause.message}` : "Non-error value thrown";

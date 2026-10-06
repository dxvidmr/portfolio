import { error, fail, isHttpError } from '@sveltejs/kit';
export function cvId(raw: string): number {
  const id = Number(raw);
  if (!Number.isSafeInteger(id) || id < 1) error(404, 'CV no encontrado.');
  return id;
}
export function cvFailure(cause: unknown) {
  if (isHttpError(cause)) return fail(cause.status, { success: false, message: cause.body.message });
  return fail(400, { success: false, message: cause instanceof Error ? cause.message : 'No se pudo completar la operación.' });
}

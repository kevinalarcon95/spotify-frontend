import { HttpErrorResponse } from '@angular/common/http';

export function resolveApiError(err: unknown, fallback: string): string {
  if (!(err instanceof HttpErrorResponse)) {
    return fallback;
  }

  if (err.status === 0) {
    return 'No se pudo conectar con el servidor.';
  }

  const body = err.error as { message?: string; details?: string[] } | null;

  if (Array.isArray(body?.details) && body.details.length > 0) {
    return body.details.join(' ');
  }

  if (typeof body?.message === 'string' && body.message) {
    return body.message;
  }

  if (err.status === 403) {
    return 'Esta acción requiere rol ADMIN.';
  }

  if (err.status === 409) {
    return 'Ya existe una lista con ese nombre.';
  }

  return fallback;
}

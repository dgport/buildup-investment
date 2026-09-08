import { Transform } from 'class-transformer';

/**
 * Multipart/form-data and query strings deliver every value as a string.
 * class-transformer's implicit conversion turns the string "false" into `true`
 * (Boolean("false") === true), so booleans need an explicit parser.
 * An empty string means "not provided" (booleans are never cleared).
 */
export function ToBoolean() {
  return Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    const normalized = String(value).trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
    return value; // let @IsBoolean() report the invalid value
  });
}

/**
 * Parses numbers. An empty string becomes `null`, which `@IsOptional()` skips
 * and which the service interprets as "clear this field" on update.
 */
export function ToNumber() {
  return Transform(({ value }) => {
    if (value === undefined) return undefined;
    if (value === null || value === '') return null;
    if (typeof value === 'number') return value;
    const parsed = Number(String(value).trim().replace(',', '.'));
    return Number.isNaN(parsed) ? value : parsed;
  });
}

/**
 * Trims strings. An empty string becomes `null` (skipped by `@IsOptional()`),
 * so the same DTO works for "not provided" (create) and "clear" (update).
 */
export function TrimToNull() {
  return Transform(({ value }) => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  });
}

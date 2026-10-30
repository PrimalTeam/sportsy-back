import { ValueTransformer } from 'typeorm';

const BASE64_TEXT = /^[A-Za-z0-9+/=\s]+$/;
const DATA_URI_PREFIX = /^data:[^;,]+;base64,/;

type SerializedBuffer = { type: 'Buffer'; data: number[] };

function isSerializedBuffer(value: unknown): value is SerializedBuffer {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as SerializedBuffer).type === 'Buffer' &&
    Array.isArray((value as SerializedBuffer).data)
  );
}

/**
 * Stores images as raw bytes in a `bytea` column while exposing them to the
 * API as base64 strings. Accepts base64, data URIs, Buffers and
 * JSON-serialized Buffers on write.
 */
export const imageTransformer: ValueTransformer = {
  to(value: unknown): unknown {
    if (value === undefined || value === null) return value;
    if (Buffer.isBuffer(value)) return value;
    if (isSerializedBuffer(value)) return Buffer.from(value.data);
    if (typeof value === 'string') {
      const base64 = value.replace(DATA_URI_PREFIX, '').replace(/\s+/g, '');
      return base64 ? Buffer.from(base64, 'base64') : null;
    }
    // Find operators and other query values pass through untouched.
    return value;
  },
  from(value: Buffer | null): string | null {
    if (!value || value.length === 0) return null;
    // Older rows hold the base64 text itself rather than the decoded bytes.
    const text = value.toString('latin1').replace(DATA_URI_PREFIX, '');
    if (BASE64_TEXT.test(text)) {
      return text.replace(/\s+/g, '');
    }
    return value.toString('base64');
  },
};

export { baptismSchema, type BaptismRecord } from './baptismSchema';
export { marriageSchema, type MarriageRecord } from './marriageSchema';
export { deathSchema, type DeathRecord } from './deathSchema';

import { baptismSchema } from './baptismSchema';
import { marriageSchema } from './marriageSchema';
import { deathSchema } from './deathSchema';

export type DocumentType = 'baptism' | 'marriage' | 'death';

export const schemaMap = {
  baptism: baptismSchema,
  marriage: marriageSchema,
  death: deathSchema
} as const;

export function getSchemaForDocumentType(type: DocumentType) {
  return schemaMap[type];
}

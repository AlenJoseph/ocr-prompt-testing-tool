import { z } from 'zod';

/**
 * Zod schema for Baptism records from Kerala Catholic church registers
 */
export const baptismSchema = z.object({
  child_name: z.string().nullable().optional(),
  father: z.string().nullable().optional(),
  mother: z.string().nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  date_of_baptism: z.string().nullable().optional(),
  place_of_birth: z.string().nullable().optional(),
  parents_residence: z.string().nullable().optional(),
  sponsors: z.array(z.string()).nullable().optional(),
  sponsors_parish: z.string().nullable().optional(),
  baptized_by: z.string().nullable().optional(),
  baptism_conducted_parish: z.string().nullable().optional(),
  parish_priest: z.string().nullable().optional(),
  record_date: z.string().nullable().optional(),
});

export type BaptismRecord = z.infer<typeof baptismSchema>;

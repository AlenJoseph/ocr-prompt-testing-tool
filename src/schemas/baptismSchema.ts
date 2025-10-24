import { z } from 'zod';

/**
 * Zod schema for Baptism records from Kerala Catholic church registers
 */
export const baptismSchema = z.object({
  child_name: z.string().describe('Full name of the child being baptized'),
  father: z.string().describe('Full name of the father'),
  mother: z.string().describe('Full name of the mother'),
  date_of_birth: z.string().describe('Date of birth in DD-MM-YYYY format'),
  date_of_baptism: z.string().describe('Date of baptism in DD-MM-YYYY format'),
  place_of_birth: z.string().describe('Place where child was born (Kerala location)'),
  parents_residence: z.string().describe('Residence of parents'),
  sponsors: z.array(z.string()).describe('List of sponsors/godparents names'),
  sponsors_parish: z.string().describe('Parish of the sponsors'),
  baptized_by: z.string().describe('Name of priest who performed baptism'),
  baptism_conducted_parish: z.string().describe('Parish where baptism was conducted'),
  parish_priest: z.string().describe('Name of parish priest who recorded this'),
  record_date: z.string().describe('Date when record was made in DD-MM-YYYY format')
});

export type BaptismRecord = z.infer<typeof baptismSchema>;

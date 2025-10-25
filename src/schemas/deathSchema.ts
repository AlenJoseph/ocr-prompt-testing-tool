import { z } from 'zod';

/**
 * Zod schema for Death records from Kerala Catholic church registers
 */
export const deathSchema = z.object({
  person_name: z.string().nullable().optional().describe('Full name of the deceased person'),
  father: z.string().nullable().optional().describe('Full name of deceased\'s father'),
  mother: z.string().nullable().optional().describe('Full name of deceased\'s mother'),
  age: z.string().nullable().optional().describe('Age of person at time of death'),
  
  death_date: z.string().nullable().optional().describe('Date of death in DD-MM-YYYY format'),
  death_time: z.string().nullable().optional().describe('Time of death (e.g., 3:00 a.m. or 5:30 p.m.)'),
  death_place: z.string().nullable().optional().describe('Place where death occurred'),
  death_reason: z.string().nullable().optional().describe('Cause or reason for death'),
  
  cell_no: z.string().nullable().optional().describe('Cell/contact number if available'),
  
  burial_date: z.string().nullable().optional().describe('Date of burial in DD-MM-YYYY format'),
  burial_time: z.string().nullable().optional().describe('Time of burial'),
  burial_place: z.string().nullable().optional().describe('Cemetery or place where buried'),
  
  parish_name: z.string().nullable().optional().describe('Parish name where person was registered'),
  parish_priest: z.string().nullable().optional().describe('Name of parish priest who recorded this'),
  
  sop_doneby: z.string().nullable().optional().describe('Priest who administered sacrament of penance'),
  holy_viaticum_by: z.string().nullable().optional().describe('Priest who administered holy viaticum'),
  anointing_of_sick_by: z.string().nullable().optional().describe('Priest who administered anointing of the sick'),
});

export type DeathRecord = z.infer<typeof deathSchema>;

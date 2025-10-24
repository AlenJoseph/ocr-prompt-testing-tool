import { z } from 'zod';

/**
 * Zod schema for Death records from Kerala Catholic church registers
 */
export const deathSchema = z.object({
  person_name: z.string().describe('Full name of the deceased person'),
  father: z.string().describe('Full name of deceased\'s father'),
  mother: z.string().describe('Full name of deceased\'s mother'),
  age: z.string().describe('Age of person at time of death'),
  
  death_date: z.string().describe('Date of death in DD-MM-YYYY format'),
  death_time: z.string().describe('Time of death (e.g., 3:00 a.m. or 5:30 p.m.)'),
  death_place: z.string().describe('Place where death occurred'),
  death_reason: z.string().describe('Cause or reason for death'),
  
  cell_no: z.string().describe('Cell/contact number if available'),
  
  burial_date: z.string().describe('Date of burial in DD-MM-YYYY format'),
  burial_time: z.string().describe('Time of burial'),
  burial_place: z.string().describe('Cemetery or place where buried'),
  
  parish_name: z.string().describe('Parish name where person was registered'),
  parish_priest: z.string().describe('Name of parish priest who recorded this'),
  
  sop_doneby: z.string().describe('Name of priest who gave sacrament of Penance'),
  holy_viaticum_by: z.string().describe('Name of priest who gave Holy Viaticum'),
  anointing_of_sick_by: z.string().describe('Name of priest who gave Anointing of the Sick')
});

export type DeathRecord = z.infer<typeof deathSchema>;

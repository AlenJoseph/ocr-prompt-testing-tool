import { z } from 'zod';

/**
 * Zod schema for Marriage records from Kerala Catholic church registers
 */
export const marriageSchema = z.object({
  groom_name: z.string().describe('Full name of the groom'),
  groom_father: z.string().describe('Full name of groom\'s father'),
  groom_mother: z.string().describe('Full name of groom\'s mother'),
  groom_birth_parish: z.string().describe('Parish where groom was born'),
  groom_dob: z.string().describe('Groom date of birth in DD-MM-YYYY format'),
  groom_age: z.string().describe('Age of groom at time of marriage'),
  groom_bap_date: z.string().describe('Groom baptism date in DD-MM-YYYY format'),
  groom_conf_date: z.string().describe('Groom confirmation date in DD-MM-YYYY format'),
  groom_parish_name: z.string().optional().describe('Parish where groom is currently registered'),
  
  bride_name: z.string().describe('Full name of the bride'),
  bride_father: z.string().describe('Full name of bride\'s father'),
  bride_mother: z.string().describe('Full name of bride\'s mother'),
  bride_parish_name: z.string().describe('Parish where bride is registered'),
  bride_birth_parish: z.string().describe('Parish where bride was born'),
  bride_dob: z.string().describe('Bride date of birth in DD-MM-YYYY format'),
  bride_age: z.string().describe('Age of bride at time of marriage'),
  bride_bap_date: z.string().describe('Bride baptism date in DD-MM-YYYY format'),
  bride_conf_date: z.string().describe('Bride confirmation date in DD-MM-YYYY format'),
  
  marriage_date: z.string().describe('Date of marriage in DD-MM-YYYY format'),
  date_of_record: z.string().describe('Date when record was made in DD-MM-YYYY format'),
  dates_of_banns: z.string().describe('Dates when banns were published'),
  place: z.string().describe('Place where marriage occurred'),
  
  celebrant_priest: z.string().describe('Name of priest who performed the marriage ceremony'),
  parish_priest: z.string().describe('Name of parish priest'),
  
  witness1: z.string().describe('Name of first witness'),
  witness2: z.string().describe('Name of second witness'),
  witness1_parish: z.string().describe('Parish of first witness'),
  witness2_parish: z.string().describe('Parish of second witness')
});

export type MarriageRecord = z.infer<typeof marriageSchema>;

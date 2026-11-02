/** Solo datos INVENTADOS. Prohibido cualquier CV o dato personal real. */
const PDF_HEAD = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-
const ZIP_HEAD = [0x50, 0x4b, 0x03, 0x04]; // PK\x03\x04
const OLE_HEAD = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]; // .doc heredado

const withPadding = (head: readonly number[], tail = 'cuerpo inventado'): Buffer =>
  Buffer.concat([Buffer.from(head), Buffer.from(tail, 'latin1')]);

export const fakePdf = (): Buffer => withPadding(PDF_HEAD);
export const fakeDocx = (): Buffer => withPadding(ZIP_HEAD, 'word/document.xml [Content_Types].xml');
export const fakeXlsx = (): Buffer => withPadding(ZIP_HEAD, 'xl/workbook.xml');
export const fakeLegacyDoc = (): Buffer => withPadding(OLE_HEAD);
export const fakeText = (): Buffer => Buffer.from('esto es texto plano inventado');

export const VALID_DRAFT_JSON = {
  fullName: 'Persona Inventada',
  email: 'Persona.Inventada@Example.Test',
  phone: '+56 9 0000 0000',
  linkedIn: 'https://www.linkedin.com/in/persona-inventada',
  location: { country: 'Chile', city: 'Santiago' },
  primaryRole: 'Backend Developer',
  seniority: 'sr',
  yearsExperience: 8,
  skills: [{ name: 'Java', level: 5, years: 8 }, { name: 'Kafka' }],
  languages: [{ code: 'es', level: 'native' }],
  education: [{ institution: 'Universidad Inventada', degree: 'Ingeniería', year: 2012 }],
  experience: [{ company: 'Empresa Inventada', role: 'Dev', from: '2015-01', to: '2023-06', summary: 'Hizo cosas.' }],
  summary: 'Perfil inventado.',
} as const;

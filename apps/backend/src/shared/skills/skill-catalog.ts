/**
 * Catálogo canónico de skills (ADR-016). Cada entrada es el nombre que ve la persona y sus alias.
 * Las skills que no están aquí se conservan tal cual: el catálogo normaliza, nunca descarta.
 * Los alias se comparan por `skillKey` (sin mayúsculas, puntos, espacios ni guiones), así que
 * "React.js", "react js" y "Reactjs" solo necesitan declararse una vez.
 */
export interface ISkillCatalogEntry {
  readonly canonical: string;
  readonly aliases: readonly string[];
}

export const SKILL_CATALOG: readonly ISkillCatalogEntry[] = [
  { canonical: 'React', aliases: ['React.js', 'ReactJS'] },
  { canonical: 'NestJS', aliases: ['Nest.js', 'Nest'] },
  { canonical: 'Node.js', aliases: ['Node', 'NodeJS'] },
  { canonical: 'Angular', aliases: ['AngularJS', 'Angular.js'] },
  { canonical: 'JavaScript', aliases: ['JS', 'ECMAScript'] },
  { canonical: 'TypeScript', aliases: ['TS'] },
  { canonical: 'Spring Boot', aliases: ['SpringBoot', 'Spring-Boot'] },
  { canonical: 'Kubernetes', aliases: ['k8s', 'K8'] },
  { canonical: 'MongoDB', aliases: ['Mongo', 'Mongo DB'] },
  { canonical: 'PostgreSQL', aliases: ['Postgres', 'Postgre'] },
  { canonical: 'AWS', aliases: ['Amazon Web Services'] },
  { canonical: 'Azure', aliases: ['Microsoft Azure'] },
  { canonical: 'GCP', aliases: ['Google Cloud', 'Google Cloud Platform'] },
  { canonical: 'Machine Learning', aliases: ['ML'] },
  { canonical: '.NET', aliases: ['dotnet', 'DotNet'] },
  { canonical: 'Microservices', aliases: ['Microservicios', 'Micro services'] },
  { canonical: 'GraphQL', aliases: ['Graph QL'] },
  { canonical: 'Docker', aliases: [] },
  { canonical: 'Java', aliases: [] },
  { canonical: 'SAP', aliases: [] },
];

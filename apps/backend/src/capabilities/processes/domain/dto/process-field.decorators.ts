import { Transform } from 'class-transformer';
import {
  ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsInt, IsNotEmpty, IsString, Max, MaxLength, Min, ValidateIf,
} from 'class-validator';
import {
  PROCESS_BAND_MAX, PROCESS_BAND_MIN, PROCESS_OPPORTUNITY_ROLE_MAX, PROCESS_ROLE_DESCRIPTION_MAX, PROCESS_SKILLS_MAX, PROCESS_SKILLS_MIN,
  PROCESS_SKILL_MAX, PROCESS_TECHNICAL_REFS_MAX,
} from '../constants/process.constants';

/** Decoradores compartidos por `CreateProcessDto` y `UpdateProcessDto`: una sola regla por campo. */
export const trim = ({ value }: { value: unknown }): unknown => (typeof value === 'string' ? value.trim() : value);
/** Omite la validación solo si el campo falta: `null` sí se valida y falla (a diferencia de `@IsOptional()`). */
export const present = (_: unknown, value: unknown): boolean => value !== undefined;

/** Recorta cada tecnología y quita duplicados sin distinguir mayúsculas, conservando la primera forma. Lo que no es lista de strings pasa tal cual. */
export const normalizeSkills = ({ value }: { value: unknown }): unknown => {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) return value;
  const seen = new Set<string>();
  return (value).map((item) => item.trim()).filter((item) => {
    const key = item.toLowerCase();
    if (item === '' || seen.has(key)) return item === '';
    seen.add(key);
    return true;
  });
};

const compose = (...decorators: PropertyDecorator[]): PropertyDecorator => (target, key) => {
  for (const decorator of decorators) decorator(target, key);
};
const optional = (isOptional: boolean): PropertyDecorator[] => (isOptional ? [ValidateIf(present)] : []);

const text = (max: number, isOptional: boolean): PropertyDecorator =>
  compose(...optional(isOptional), Transform(trim), IsString(), IsNotEmpty(), MaxLength(max));

export const OpportunityRoleField = (isOptional = false): PropertyDecorator => text(PROCESS_OPPORTUNITY_ROLE_MAX, isOptional);
export const RoleDescriptionField = (isOptional = false): PropertyDecorator => text(PROCESS_ROLE_DESCRIPTION_MAX, isOptional);

export const SkillsField = (isOptional = false): PropertyDecorator =>
  compose(
    ...optional(isOptional), Transform(normalizeSkills), IsArray(), ArrayMinSize(PROCESS_SKILLS_MIN), ArrayMaxSize(PROCESS_SKILLS_MAX),
    IsString({ each: true }), IsNotEmpty({ each: true }), MaxLength(PROCESS_SKILL_MAX, { each: true }),
  );

export const BandField = (isOptional = false): PropertyDecorator =>
  compose(...optional(isOptional), IsInt(), Min(PROCESS_BAND_MIN), Max(PROCESS_BAND_MAX));

/** Ids de referentes técnicos: lista (vacía válida) de a lo sumo `PROCESS_TECHNICAL_REFS_MAX` ids no vacíos y sin repetir. */
export const TechnicalRefIdsField = (isOptional = false): PropertyDecorator =>
  compose(...optional(isOptional), IsArray(), ArrayMaxSize(PROCESS_TECHNICAL_REFS_MAX), ArrayUnique(), IsString({ each: true }), IsNotEmpty({ each: true }));

/** «Martín Rodríguez» → «Martín R.»; un solo nombre queda igual. Usa el primer y el último término. */
export function abbreviateName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] ?? '';
  const last = parts[parts.length - 1] ?? '';
  return `${parts[0]} ${last.charAt(0).toUpperCase()}.`;
}

/** Une con coma y «y» final: «A», «A y B», «A, B y C». */
export function joinNames(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`;
}

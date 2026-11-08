/**
 * brand — nombre y versión del producto en un único lugar (config global).
 * Lo leen features y shared; ningún texto visible debe llevar el nombre literal.
 * - productName:     nombre corto, sin «IBM» (se muestra junto a la pastilla «IBM»).
 * - productFullName: nombre completo («IBM Future Now Portal»).
 */
export const BRAND = {
  companyName:     'IBM',
  productName:     'Future Now Portal',
  productFullName: 'IBM Future Now Portal',
  unitName:        'IBM Consulting',
  version:         'v2.4.0',
} as const;

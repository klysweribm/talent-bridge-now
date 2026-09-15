# Ejemplos ejecutables — Frontend

Estos archivos son plantillas reales para copiar, no solo descripciones. Cada
uno respeta los límites de línea y las reglas de `.clinerules` /
`BEST-PRACTICES.md`. Donde ya existe una implementación real que cumple, el
ejemplo la referencia en vez de duplicarla:

- Atom que cumple hoy: `apps/frontend/src/shared/components/atoms/StageChip/StageChip.tsx`
- Molecule que cumple hoy: `apps/frontend/src/shared/components/molecules/KpiCard/KpiCard.tsx`
  e `InterviewCard/InterviewCard.tsx`
- Store que cumple hoy: `apps/frontend/src/features/auth/store/auth.store.ts`

## Regla sobre mockups de `DESIGN/` (Stitch)

Los archivos `DESIGN/stitch_ibm_talent_bridge_portal/**/code.html` son **solo
guía visual** — nunca se copian ni se transcriben literalmente. El
`LoginPage.tsx` original (422 líneas, `style={{...}}` con hex literales en
cada nodo) es el resultado de hacerlo mal: es una transliteración casi 1:1
del HTML de Stitch, no un componente. `page.example.tsx` y
`organism.example.tsx` muestran el proceso correcto para traducir un mockup:

1. Leer el `code.html` y el `screen.png` solo para identificar: layout,
   jerarquía visual, textos, y qué elementos se repiten.
2. Mapear cada bloque repetido/reusable a un atom o molecule — nunca dejarlo
   inline en la page.
3. Reemplazar todo color/spacing hardcodeado por clases Tailwind del
   `tailwind.config.ts` o por `design-tokens.ts` (nunca `style={{ color: '#...' }}`
   salvo que el valor sea dinámico en runtime, como `STAGE_CHIP_STYLES`).
4. Cualquier dato que el mockup muestra como "ya cargado" (KPIs, listas,
   nombres) se modela como `infrastructure/*.infra.ts` + hook de React Query
   — nunca como constantes `MOCK_*` dentro de la page.

## Índice

| Archivo | Capa | Límite |
| --- | --- | --- |
| `atom.example.tsx` | Atom | 50 líneas |
| `molecule.example.tsx` | Molecule | 90 líneas |
| `organism.example.tsx` | Organism | 100 líneas |
| `page.example.tsx` | Page | 90 líneas |
| `hook.example.ts` | Hook | 60 líneas |
| `infrastructure.example.ts` | Infrastructure | 50 líneas |
| `store.example.ts` | Store (Zustand) | 50 líneas |

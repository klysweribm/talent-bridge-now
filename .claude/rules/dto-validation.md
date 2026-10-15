---
paths:
  - "apps/backend/src/**/domain/dto/**/*.ts"
---

# DTO conventions (`domain/dto/*.dto.ts`)

- Every new endpoint input has a `class-validator` DTO — no unvalidated `@Body()`.
- `@IsString()`/`@IsEmail()`/`@IsEnum()`/`@IsMongoId()`/etc. on required fields, `@IsOptional()` on optional ones; `@ValidateNested({ each: true })` + `@Type(() => ChildDto)` for nested objects/arrays.
- Pagination/filter query DTOs use `@Type(() => Number)` + `@Min`/`@Max` so `limit` can never be unbounded.
- No `@ApiProperty()` here — `@nestjs/swagger` is NestJS, and `domain/` allows zero NestJS (`BEST-PRACTICES.md` §3.1). Swagger schemas for DTOs come from the Nest CLI Swagger plugin (`nest-cli.json` → `plugins`), not decorators. If the plugin isn't configured yet when you need it, say so instead of adding decorators.
- Enums (stages, roles, interview states) come from one shared definition — reuse it in `@IsEnum(...)`, never retype the literal list.
- Hard limit (see `good-practices/validate-quality.mjs`): if a payload needs more, split into nested DTOs rather than one flat class.
- The only accepted external imports in `domain/dto/` are `class-validator` and `class-transformer` (documented in `BEST-PRACTICES.md` §3.1). Entities/value objects in `domain/interfaces/` stay decorator-free.

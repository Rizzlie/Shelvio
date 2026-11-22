# shared-contracts

`@shelvio/shared/contracts` (`scope:shared`, `type:util`): REST contracts as Zod schemas, shared enum consts and the error-code vocabulary, used by both `web` and `api`. Must not import Angular or NestJS.

## Error codes

`ErrorCode` lists every code the API can return, and `Problem` is the shape of every error response (`application/problem+json`, RFC 9457):

```json
{
  "type": "about:blank",
  "title": "Not Found",
  "status": 404,
  "code": "common.notFound",
  "params": { "bookId": "…" }
}
```

The API never sends translated text. The web app translates by `code` and interpolates `params`. A request that breaks its contract gets `request.invalid`, and `params.issues` lists `{ path, code, details }` per problem. `path` starts with the request part (`['body', 'title']`, `['params', 'bookId']`, `['query', 'limit']`), and `code` and `details` are Zod's issue code and fields (`too_small` with `minimum`, and so on).

To add a code, add it to `ErrorCode` (namespaced by module, such as `collection.notFound`), then throw it from the API with one of the domain errors in `@shelvio/api/errors`.

## REST contracts

Each route's input and output is defined here once, as Zod schemas, and both sides use it:

```ts
// libs/shared/contracts/src/lib/books.ts
export const CreateBookRequest = z.object({ title: z.string().trim().min(1) });
export type CreateBookRequest = z.infer<typeof CreateBookRequest>;
export const BookParams = z.object({ bookId: z.uuid() });
```

The API wraps a schema in a `nestjs-zod` DTO class and types the controller parameter with it. The app-wide pipe validates `@Body()`, `@Param()` and `@Query()` and hands the controller the parsed value, with transforms such as `.trim()` and defaults applied:

```ts
class CreateBookDto extends createZodDto(CreateBookRequest) {}
class BookParamsDto extends createZodDto(BookParams) {}

@Post(':bookId/copies')
create(@Param() params: BookParamsDto, @Body() body: CreateBookDto) { … }
```

The pipe is strict: a body, params or query typed with anything else (`@Param('id') id: string`) fails the request with a 500, so no input reaches a controller unchecked. Read params and query as one object (`@Param()`, `@Query()`), not by name. The Angular client imports the same schemas and types.

Run `nx test shared-contracts` to execute the unit tests via [Vitest](https://vitest.dev/).

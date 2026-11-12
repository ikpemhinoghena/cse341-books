# Books API Week 02 Spec - Version 1

## Feature 1: Book CRUD Operations and Author References

### Goal
Update the existing Week 01 book API so book documents include a reference to an author and the API supports all CRUD operations for books. Every book route must be documented and testable in Swagger.

### Data Model
Book documents will be stored in the `books` collection.

Required book fields:
- `id`: string, required, custom id such as `b1`
- `authorId`: string, required, references the `id` field of an author document
- `title`: string, required
- `publicationDate`: string, required

Books will continue to use custom string ids instead of MongoDB `_id` values for route parameters.

### Relationship to Authors
Each book will identify its author with an `authorId` field. The value of `authorId` must match the custom `id` value of an existing author document.

When creating or updating a book, the API should reject the request with a `400` status code if the submitted `authorId` does not match an existing author.

### Routes

#### GET /books
Purpose: Return all books.

Success:
- Status code: `200`
- Response body: an array of book objects

Errors:
- `500` if an unexpected server or database error occurs

#### GET /books/:id
Purpose: Return one book by its custom id.

Success:
- Status code: `200`
- Response body: the matching book object

Errors:
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

#### POST /books
Purpose: Create a new book.

Request body:

    {
      "id": "b4",
      "authorId": "a1",
      "title": "Example Book Title",
      "publicationDate": "2026-01-15"
    }

Success:
- Status code: `201`
- Response body: the newly created book object

Errors:
- `400` if a required field is missing
- `400` if the `id` already exists
- `400` if the `authorId` does not match an existing author
- `500` if an unexpected server or database error occurs

#### PUT /books/:id
Purpose: Update an existing book.

Request body:

    {
      "authorId": "a2",
      "title": "Updated Book Title",
      "publicationDate": "2026-02-20"
    }

Success:
- Status code: `200`
- Response body: the updated book object

Errors:
- `400` if a required field is missing
- `400` if the `authorId` does not match an existing author
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

#### DELETE /books/:id
Purpose: Delete an existing book.

Success:
- Status code: `204`
- Response body: none

Errors:
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

### Swagger Documentation
Swagger must document every book route.

### Deployment Expectations
After implementation, the book routes must work locally and from the deployed Render application. The deployed Swagger page at `/api-docs` must allow someone to test every book route from the browser.

## Feature 2: Author CRUD Operations

### Goal
Support a separate authors collection with full CRUD operations. Books will reference authors by their custom string ids. Every author route must be documented and testable in Swagger.

### Data Model
Author documents will be stored in the `authors` collection.

Required author fields:
- `id`: string, required, custom id such as `a1`; must contain at least one non-whitespace character and be unique among authors
- `name`: string, required; must contain at least one non-whitespace character
- `birthYear`: JSON number, required; must be an integer from `1` through the current calendar year in UTC, inclusive

Authors will use custom string ids instead of MongoDB `_id` values for route parameters. Id comparisons are exact and case-sensitive. An author's custom `id` cannot be changed by an update.

POST requires all three fields. PUT requires both `name` and `birthYear` and identifies the author through the route parameter. Missing fields, null values, incorrect data types, blank strings, and out-of-range or fractional birth years must be rejected with `400`. A numeric string is not a valid `birthYear`. If a PUT body includes `id`, it must equal the route parameter; otherwise, reject the request with `400`.

### Relationship to Books
The `authorId` field of a book references the custom `id` field of an author document.

An author must not be deleted while any book has an `authorId` matching that author's `id`. Reject such a deletion with `409` and leave both the author and all books unchanged. The referencing books must first be reassigned to another existing author or deleted through the book API. Do not automatically delete or modify books when deleting an author.

### Routes

#### GET /authors
Purpose: Return all authors.

Success:
- Status code: `200`
- Response body: an array of author objects containing `id`, `name`, and `birthYear`; return `[]` when no authors exist

Errors:
- `500` if an unexpected server or database error occurs
- Response body: `{"message":"Internal server error"}`

#### GET /authors/:id
Purpose: Return one author by its custom id.

Success:
- Status code: `200`
- Response body: the matching author object containing `id`, `name`, and `birthYear`

Errors:
- `404` if no author exists with that id; response body: `{"message":"Author not found"}`
- `500` if an unexpected server or database error occurs; response body: `{"message":"Internal server error"}`

#### POST /authors
Purpose: Create a new author.

Request body:

    {
      "id": "a1",
      "name": "Maya Rivera",
      "birthYear": 1985
    }

Success:
- Status code: `201`
- Response body: the newly created author object containing the accepted `id`, `name`, and `birthYear`

Errors:
- `400` if a required field is missing or invalid, or the request body is not a valid JSON object; response body: `{"message":"Invalid author data"}`
- `400` if the `id` already exists; response body: `{"message":"Author id already exists"}`
- `500` if an unexpected server or database error occurs; response body: `{"message":"Internal server error"}`

Reject duplicate ids without overwriting the existing author. A rejected request must not create an author.

#### PUT /authors/:id
Purpose: Update an existing author's name and birth year while preserving its custom id and existing book references.

Request body:

    {
      "name": "Maya L. Rivera",
      "birthYear": 1986
    }

Success:
- Status code: `200`
- Response body: the updated author object containing the unchanged `id` and the accepted `name` and `birthYear`

Errors:
- `400` if a required field is missing or invalid, the request body is not a valid JSON object, or a supplied `id` differs from the route parameter; response body: `{"message":"Invalid author data"}`
- `404` if no author exists with that id; response body: `{"message":"Author not found"}`
- `500` if an unexpected server or database error occurs; response body: `{"message":"Internal server error"}`

Validate the request body before checking whether the author exists. Do not create an author when the requested id is absent, and do not modify an author when validation fails.

#### DELETE /authors/:id
Purpose: Delete an existing author only when no books reference that author.

Success:
- Status code: `204`
- Response body: none

Errors:
- `404` if no author exists with that id; response body: `{"message":"Author not found"}`
- `409` if one or more books reference the author; response body: `{"message":"Cannot delete author while books reference this author"}`
- `500` if an unexpected server or database error occurs; response body: `{"message":"Internal server error"}`

Check that the author exists before checking book references. A rejected deletion must leave the author and books unchanged.

All response bodies must use JSON, except the empty `204` response. POST and PUT request bodies must use `application/json`. Error responses must not expose stack traces, database error details, or credentials.

### Swagger Documentation
Swagger must document every author route, using `/authors` and `/authors/{id}`. Include a summary, the Authors tag, required string path parameters, POST and PUT request bodies, required fields, data types, validation rules, examples, success responses, and every specified error response. Document the duplicate-id rule, immutable custom id, and the `409` response that prevents deletion of a referenced author.

### Deployment Expectations
After implementation, the author routes must work locally and from the deployed Render application. The deployed Swagger page at `/api-docs` must allow someone to test every author route from the browser. Verify successful CRUD operations, missing-author responses, invalid and duplicate data rejection, and prevention of deletion while books reference an author in both environments.

# Books API Week 02 Spec - Version 2

## Feature 1: Book CRUD Operations and Author References

### Goal
Extend the Week 01 API with book CRUD operations and valid author references. Preserve the Version 1 routes and status codes. Every route must be documented and testable in Swagger locally and on Render.

### Data Model
Store books in the `books` collection with these required fields:

- `id`: unique custom string, such as `b1`.
- `authorId`: custom string matching an existing author's `id`.
- `title`: string.
- `publicationDate`: string representing a real calendar date in exactly `YYYY-MM-DD` format, with a year from `0001` through `9999`. Reject impossible dates, including invalid leap days, rather than normalizing them. Future publication dates are permitted.

All required strings must contain at least one non-whitespace character. Reject missing fields, nulls, and incorrect types without coercion. Preserve accepted strings as supplied; custom IDs and references are compared exactly and case-sensitively. Route parameters use the decoded custom string `id`, never MongoDB `_id` or ObjectId conversion.

MongoDB may retain its internal `_id`, but successful API responses must omit `_id` and any other internal fields. A book response contains exactly `id`, `authorId`, `title`, and `publicationDate`. Return stored values without embedding an author object.

### Request Validation and Error Contract
These input-handling rules apply to both features, with feature-specific validation messages:

- POST and PUT require `application/json` and one JSON object. Reject missing bodies, malformed JSON, arrays, primitives, and null with `400` and the feature's invalid-data response. A request with a different or missing Content-Type also receives that response.
- Validate the complete body before performing database writes. Do not persist any part of a rejected request.
- Reject unknown fields, including `_id`, with `400`. Build insert and update documents from explicitly permitted, validated fields. Never use a submitted object directly as a database filter or update expression.
- Books POST permits and requires `id`, `authorId`, `title`, and `publicationDate`.
- Books PUT requires `authorId`, `title`, and `publicationDate`. An optional `id` is permitted only if it is a valid string exactly equal to the URL id. It is not written as an update. Any attempt to change it receives `400`.
- PUT updates the existing document identified by the URL. It is not a partial update and must not insert a missing document. An update containing the same values is still successful.
- All nonempty response bodies use `application/json`. Successful DELETE responses are `204` with no body, not JSON null or an empty object.
- All unexpected server or database failures return `500` with exactly `{"message":"Internal server error"}`. Log a short server-side message without credentials; do not send database messages, stack traces, or connection details to clients.

For books, the exact error responses are:

| Status | Condition | JSON body |
| --- | --- | --- |
| 400 | Invalid request body, field, Content-Type, unknown field, or attempted ID change | `{"message":"Invalid book data"}` |
| 400 | Duplicate custom book id | `{"message":"Book id already exists"}` |
| 400 | Submitted authorId does not identify an existing author | `{"message":"Author not found"}` |
| 404 | No book matches the URL id | `{"message":"Book not found"}` |
| 500 | Unexpected server or database failure | `{"message":"Internal server error"}` |

### Relationship to Authors
Before inserting or updating a book, verify that its `authorId` identifies an existing author. Reject a missing reference with the specified `400` response. Deleting a book must not delete its author. Author deletion follows Feature 2's restriction and must not cascade to books.

### Reliable Custom ID Uniqueness
Before enabling writes, require a unique index on `books.id` and a separate unique index on `authors.id`, using exact, case-sensitive comparisons. An application-level duplicate check alone is insufficient. Catch duplicate-key violations for these indexes and return the appropriate feature's duplicate-id `400` response, including when simultaneous creation requests use the same id. Never overwrite an existing document to resolve a duplicate.

If existing data prevents index creation, identify and resolve it through an explicitly reviewed data preparation step before accepting writes. Do not silently delete or rename records. An index on `books.authorId` supports author-reference checks; check for one matching book rather than loading all referencing books.

### Transition from Week 01 Books
Before accepting the updated API as complete, prepare an explicit mapping from each existing book's author name to a verified author document and its custom id. Author documents must include valid `id`, `name`, and `birthYear`; do not invent unknown birth years or assume that matching names always identify the same person.

For each existing book, preserve `id`, `title`, and `publicationDate`, add its verified `authorId`, and remove the legacy `author` field once the reference has been verified. Review any missing or ambiguous mapping and any invalid existing field before modifying that record. Verify that all existing books satisfy this model and reference existing authors before deployment acceptance. This document authorizes no data changes itself.

### Routes

#### GET /books
Purpose: Return all books.

Success: `200` with an array of book response objects; return `[]` when no books exist. Ordering is not guaranteed.

Example response:

```json
[{"id":"b4","authorId":"a1","title":"Example Book Title","publicationDate":"2026-01-15"}]
```

Errors: `500` with `{"message":"Internal server error"}`.

#### GET /books/:id
Purpose: Return the book matching the custom string id.

Success: `200` with one book response object, for example:

```json
{"id":"b4","authorId":"a1","title":"Example Book Title","publicationDate":"2026-01-15"}
```

Errors: `404` with `{"message":"Book not found"}`; unexpected failures return `500` with `{"message":"Internal server error"}`.

#### POST /books
Purpose: Create a book with a unique custom id and an existing author reference.

Example request body:

```json
{"id":"b4","authorId":"a1","title":"Example Book Title","publicationDate":"2026-01-15"}
```

Success: `201` with the created book. For this request, the response body is exactly the example request object, without `_id`.

Errors: `400` for invalid data, duplicate id, or unknown author; `500` for unexpected failures. Use the exact bodies in the Books error table. Validate the body first, check for an existing book id second, and verify the author third. The unique index remains authoritative if a competing insertion occurs afterward.

#### PUT /books/:id
Purpose: Update the book identified by the URL without changing its custom id.

Example request body for `/books/b4`:

```json
{"authorId":"a2","title":"Updated Book Title","publicationDate":"2026-02-20"}
```

Success: `200` with the updated book:

```json
{"id":"b4","authorId":"a2","title":"Updated Book Title","publicationDate":"2026-02-20"}
```

Errors: `400` for invalid data or unknown author; `404` for a missing book; `500` for unexpected failures. Use the exact bodies in the Books error table. Validate the body first, check book existence second, and verify the author third. If the target no longer exists when the update is applied, return the missing-book `404` rather than reporting success.

#### DELETE /books/:id
Purpose: Delete the book identified by its custom id.

Success: `204` with no response body.

Errors: `404` with `{"message":"Book not found"}` if no document is deleted; `500` with `{"message":"Internal server error"}` for unexpected failures. Leave author documents unchanged.

### Swagger Documentation
Document all five routes using `/books` and `/books/{id}`, the Books tag, summaries, required string path parameters, JSON request schemas, required fields, examples, and every specified success and error response. Document immutable ids, date validation, unknown-field rejection, duplicate-id handling, author-reference validation, omitted `_id`, and empty arrays. A `204` response must have no content schema. Swagger must match the implemented API contract.

### Deployment Expectations
Use the existing Express ES module application, official MongoDB driver, configured database, and Render deployment. After implementation and reviewed data preparation, verify all book routes locally and on Render through `/api-docs`, including empty collections, invalid requests, duplicate ids, unknown authors, missing books, and successful CRUD responses. Do not change credentials or network security as part of this specification.

## Feature 2: Author CRUD Operations

### Goal
Provide full CRUD operations for a separate authors collection while preventing deletion of authors referenced by books. Every author route must be documented and testable in Swagger locally and on Render.

### Data Model
Store authors in the `authors` collection with these required fields:

- `id`: unique custom string, such as `a1`, containing at least one non-whitespace character.
- `name`: string containing at least one non-whitespace character.
- `birthYear`: JSON number that is an integer from `1` through the current calendar year in UTC, inclusive. Reject numeric strings, nulls, fractional values, and years outside this range.

Custom ids are exact and case-sensitive, are immutable after creation, and are used in route parameters instead of MongoDB `_id`. Preserve valid string values without automatic trimming or case changes. Author responses contain exactly `id`, `name`, and `birthYear`; omit `_id` and other internal fields.

### Request Validation and Error Contract
Apply the shared JSON, validation-before-write, permitted-field, safe-write, and error-handling rules in Feature 1.

POST permits and requires `id`, `name`, and `birthYear`. PUT requires `name` and `birthYear`; it may also include a valid string `id` only when that value equals the URL id. Do not update the id. Reject missing fields, incorrect types, nulls, blank required strings, malformed bodies, and unknown fields. PUT is a complete update of name and birthYear, never an insertion or partial update.

Enforce custom-id uniqueness with the unique `authors.id` index described in Feature 1. Rejected validation and duplicate-id requests leave existing documents unchanged.

The exact author error responses are:

| Status | Condition | JSON body |
| --- | --- | --- |
| 400 | Invalid request body, field, Content-Type, unknown field, or attempted ID change | `{"message":"Invalid author data"}` |
| 400 | Duplicate custom author id | `{"message":"Author id already exists"}` |
| 404 | No author matches the URL id | `{"message":"Author not found"}` |
| 409 | One or more books reference the author being deleted | `{"message":"Cannot delete author while books reference this author"}` |
| 500 | Unexpected server or database failure | `{"message":"Internal server error"}` |

### Relationship to Books
A book's `authorId` references an author's custom `id`. Updating an author's name or birthYear leaves the custom id and book references unchanged.

Before deleting an author, confirm that the author exists and check for any book whose `authorId` matches it. If a reference exists, return the specified `409` and leave the author and all books unchanged. Reassign or delete referencing books through the book API before retrying author deletion. Do not automatically modify or cascade-delete books.

These checks do not by themselves guarantee reference integrity when book writes and author deletion happen concurrently. Cross-document transactional coordination is outside this assignment's scope. Verify the deletion restriction using sequential requests, and do not claim a concurrency guarantee from separate existence checks. Database-enforced custom-id uniqueness remains required even for concurrent creation requests.

### Routes

#### GET /authors
Purpose: Return all authors.

Success: `200` with an array of author response objects; return `[]` when no authors exist. Ordering is not guaranteed.

Example response:

```json
[{"id":"a1","name":"Maya Rivera","birthYear":1985}]
```

Errors: `500` with `{"message":"Internal server error"}`.

#### GET /authors/:id
Purpose: Return the author matching the custom string id.

Success: `200` with one author response object, for example:

```json
{"id":"a1","name":"Maya Rivera","birthYear":1985}
```

Errors: `404` with `{"message":"Author not found"}`; unexpected failures return `500` with `{"message":"Internal server error"}`.

#### POST /authors
Purpose: Create an author with a unique custom id.

Example request body:

```json
{"id":"a1","name":"Maya Rivera","birthYear":1985}
```

Success: `201` with the created author. For this request, the response body is exactly the example request object, without `_id`.

Errors: `400` for invalid data or duplicate id; `500` for unexpected failures. Use the exact bodies in the Authors error table. Validate the body before checking duplicates. The unique index rejects any competing insertion with the same id; map that violation to the duplicate-id `400` response, not a generic `500`.

#### PUT /authors/:id
Purpose: Update the existing author's name and birthYear without changing its custom id.

Example request body for `/authors/a1`:

```json
{"name":"Maya L. Rivera","birthYear":1986}
```

Success: `200` with the updated author:

```json
{"id":"a1","name":"Maya L. Rivera","birthYear":1986}
```

Errors: `400` for invalid data; `404` for a missing author; `500` for unexpected failures. Use the exact bodies in the Authors error table. Validate the body before checking existence. Do not insert a missing author. If the target disappears before the update is applied, return the missing-author `404`. Submitting unchanged valid values returns `200`.

#### DELETE /authors/:id
Purpose: Delete an existing author only when no books reference it.

Success: `204` with no response body.

Errors: `404` for a missing author; `409` for an author referenced by books; `500` for unexpected failures. Use the exact bodies in the Authors error table. Check author existence before checking references. If no author is deleted because it no longer exists, return `404` rather than reporting success. Never delete or update books as a side effect.

### Swagger Documentation
Document all five routes using `/authors` and `/authors/{id}`, the Authors tag, summaries, required string path parameters, complete JSON POST and PUT schemas, required fields, examples, and every specified success and error response. Document birthYear validation, immutable ids, unknown-field rejection, duplicate ids, omitted `_id`, empty arrays, and the referenced-author `409`. A `204` response must have no content schema. Swagger must match the implemented API contract.

### Deployment Expectations
After implementation, verify all author routes locally and on Render using the existing project configuration. The deployed `/api-docs` page must support testing every route. Verify valid CRUD operations, empty lists, malformed and invalid requests, duplicate ids, missing authors, unchanged updates, and rejection of referenced-author deletion. Confirm that rejected requests preserve data and that reassignment or removal of references allows a later deletion.

Version 2 adds no authentication, pagination, advanced joins, or complex database transactions. The public course API should use demonstration data only. This specification does not implement functionality or authorize deployment or database changes.

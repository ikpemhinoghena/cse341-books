import express from 'express';
import { getBooksHandler, getBookByIdHandler } from './controllers/books.js';
import { getAllAuthors, getAuthorById, createAuthor, updateAuthor, deleteAuthor } from './controllers/authors.js';

const router = express.Router();

/**
 * @openapi
 * /books:
 *   get:
 *     summary: Retrieve all books
 *     tags: [Books]
 *     responses:
 *       '200':
 *         description: An array of book documents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   id:
 *                     type: string
 *                   author:
 *                     type: string
 *                   title:
 *                     type: string
 *                   publicationDate:
 *                     type: string
 *       '500':
 *         description: An unexpected server error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [message]
 *               properties:
 *                 message:
 *                   type: string
 *                   enum: [Internal server error]
 *             example:
 *               message: Internal server error
 */
router.get('/books', getBooksHandler);
/**
 * @openapi
 * /books/{id}:
 *   get:
 *     summary: Retrieve a book by its custom string ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The book's custom string ID
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: The matching book document
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 id:
 *                   type: string
 *                 author:
 *                   type: string
 *                 title:
 *                   type: string
 *                 publicationDate:
 *                   type: string
 *       '404':
 *         description: No book matches the requested ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [message]
 *               properties:
 *                 message:
 *                   type: string
 *                   enum: [Book not found]
 *             example:
 *               message: Book not found
 *       '500':
 *         description: An unexpected server error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [message]
 *               properties:
 *                 message:
 *                   type: string
 *                   enum: [Internal server error]
 *             example:
 *               message: Internal server error
 */
router.get('/books/:id', getBookByIdHandler);

/**
 * @openapi
 * /authors:
 *   get:
 *     summary: Retrieve all authors
 *     tags: [Authors]
 *     responses:
 *       '200':
 *         description: An array of authors, or an empty array when none exist
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 required: [id, name, birthYear]
 *                 additionalProperties: false
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   birthYear:
 *                     type: integer
 *                     minimum: 1
 *                     description: Birth year no later than the current UTC calendar year
 *             example:
 *               - id: a1
 *                 name: Maya Rivera
 *                 birthYear: 1985
 *       '500':
 *         description: An unexpected server or database error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [message]
 *               additionalProperties: false
 *               properties:
 *                 message:
 *                   type: string
 *                   enum: [Internal server error]
 *             example:
 *               message: Internal server error
 */
router.get('/authors', getAllAuthors);

/**
 * @openapi
 * components:
 *   schemas:
 *     Author:
 *       type: object
 *       required: [id, name, birthYear]
 *       additionalProperties: false
 *       properties:
 *         id:
 *           type: string
 *           pattern: '\S'
 *           description: Immutable custom string ID, compared exactly and case-sensitively
 *           example: a1
 *         name:
 *           type: string
 *           pattern: '\S'
 *           example: Maya Rivera
 *         birthYear:
 *           type: integer
 *           minimum: 1
 *           description: Integer no later than the current UTC calendar year; numeric strings are rejected
 *           example: 1985
 *     AuthorError:
 *       type: object
 *       required: [message]
 *       additionalProperties: false
 *       properties:
 *         message:
 *           type: string
 * /authors/{id}:
 *   get:
 *     summary: Retrieve an author by custom ID
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Exact, case-sensitive custom author ID
 *         schema:
 *           type: string
 *         example: a1
 *     responses:
 *       '200':
 *         description: The matching author, excluding MongoDB _id and other internal fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *             example: {id: a1, name: Maya Rivera, birthYear: 1985}
 *       '404':
 *         description: No author matches the custom ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthorError'
 *             example: {message: Author not found}
 *       '500':
 *         description: An unexpected server or database error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthorError'
 *             example: {message: Internal server error}
 */
router.get('/authors/:id', getAuthorById);

/**
 * @openapi
 * /authors:
 *   post:
 *     summary: Create an author
 *     tags: [Authors]
 *     description: Requires a JSON object with only id, name, and birthYear. Rejects missing, null, blank, or incorrectly typed fields, malformed JSON, missing or incorrect Content-Type, and unknown fields. Valid strings are preserved without trimming. A unique case-sensitive index prevents duplicate IDs, including concurrent requests.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Author'
 *           example: {id: a1, name: Maya Rivera, birthYear: 1985}
 *     responses:
 *       '201':
 *         description: The created author without MongoDB _id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *             example: {id: a1, name: Maya Rivera, birthYear: 1985}
 *       '400':
 *         description: Invalid author data or duplicate custom ID; no author is created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [message]
 *               additionalProperties: false
 *               properties:
 *                 message:
 *                   type: string
 *                   enum: [Invalid author data, Author id already exists]
 *             examples:
 *               invalid:
 *                 value: {message: Invalid author data}
 *               duplicate:
 *                 value: {message: Author id already exists}
 *       '500':
 *         description: An unexpected server or database error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthorError'
 *             example: {message: Internal server error}
 */
router.post('/authors', createAuthor);

/**
 * @openapi
 * /authors/{id}:
 *   put:
 *     summary: Update an existing author
 *     tags: [Authors]
 *     description: Requires name and birthYear in a JSON object. Optional id must exactly match the URL and is never changed. Rejects missing, null, blank, incorrectly typed or unknown fields, malformed JSON, and missing or incorrect Content-Type. Validates before checking existence. Never inserts a missing author. Unchanged valid values return 200. Existing book references remain unchanged.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Exact, case-sensitive custom author ID
 *         schema:
 *           type: string
 *         example: a1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, birthYear]
 *             additionalProperties: false
 *             properties:
 *               id:
 *                 type: string
 *                 pattern: '\S'
 *                 description: Immutable custom string ID, compared exactly and case-sensitively
 *                 example: a1
 *               name:
 *                 type: string
 *                 pattern: '\S'
 *                 example: Maya Rivera
 *               birthYear:
 *                 type: integer
 *                 minimum: 1
 *                 description: Integer no later than the current UTC calendar year; numeric strings are rejected
 *                 example: 1985
 *           example: {name: Maya L. Rivera, birthYear: 1986}
 *     responses:
 *       '200':
 *         description: The updated author with its original ID and without MongoDB _id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *             example: {id: a1, name: Maya L. Rivera, birthYear: 1986}
 *       '400':
 *         description: Invalid author data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthorError'
 *             example: {message: Invalid author data}
 *       '404':
 *         description: No author matches the custom ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthorError'
 *             example: {message: Author not found}
 *       '500':
 *         description: An unexpected server or database error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthorError'
 *             example: {message: Internal server error}
 */
router.put('/authors/:id', updateAuthor);

/**
 * @openapi
 * /authors/{id}:
 *   delete:
 *     summary: Delete an unreferenced author
 *     tags: [Authors]
 *     description: Checks author existence before book references. Rejects deletion while any book authorId matches the author ID. Never modifies or deletes books. Reassign or delete referencing books before retrying. Separate checks do not guarantee reference integrity during concurrent book writes and author deletion.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Exact, case-sensitive custom author ID
 *         schema:
 *           type: string
 *         example: a1
 *     responses:
 *       '204':
 *         description: Author deleted; no response body
 *       '404':
 *         description: No author matches the custom ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthorError'
 *             example: {message: Author not found}
 *       '409':
 *         description: Books still reference this author; all records remain unchanged
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthorError'
 *             example: {message: Cannot delete author while books reference this author}
 *       '500':
 *         description: An unexpected server or database error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthorError'
 *             example: {message: Internal server error}
 */
router.delete('/authors/:id', deleteAuthor);

export default router;

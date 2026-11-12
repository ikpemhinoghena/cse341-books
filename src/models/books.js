import { getDb } from '../db/connect.js';

const projection = { _id: 0, id: 1, authorId: 1, title: 1, publicationDate: 1 };

const ensureBookIndexes = async () => {
  const books = getDb().collection('books');
  await books.createIndex({ id: 1 }, { unique: true, collation: { locale: 'simple' } });
  await books.createIndex({ authorId: 1 }, { collation: { locale: 'simple' } });
};

export const getAllBooks = async () => {
  const books = await getDb().collection('books').find({}).project(projection).toArray();
  return books;
};

export const getBookById = async (bookId) => {
  const book = await getDb().collection('books').findOne(
    { id: bookId },
    { projection, collation: { locale: 'simple' } }
  );
  return book;
};

export const createBook = async ({ id, authorId, title, publicationDate }) => {
  await ensureBookIndexes();
  try {
    await getDb().collection('books').insertOne({ id, authorId, title, publicationDate });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.id === 1) {
      const duplicateError = new Error('Book id already exists');
      duplicateError.code = 'BOOK_ID_EXISTS';
      throw duplicateError;
    }
    throw error;
  }
  return { id, authorId, title, publicationDate };
};

export const updateBook = async (bookId, { authorId, title, publicationDate }) => {
  await ensureBookIndexes();
  return await getDb().collection('books').findOneAndUpdate(
    { id: bookId },
    { $set: { authorId, title, publicationDate } },
    {
      returnDocument: 'after',
      includeResultMetadata: false,
      upsert: false,
      projection,
      collation: { locale: 'simple' }
    }
  );
};

export const deleteBook = async (bookId) => {
  await ensureBookIndexes();
  const result = await getDb().collection('books').deleteOne(
    { id: bookId },
    { collation: { locale: 'simple' } }
  );
  return result.deletedCount;
};

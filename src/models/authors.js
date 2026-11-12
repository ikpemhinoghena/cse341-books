import { getDb } from '../db/connect.js';

export const getAllAuthors = async () => {
  const authors = await getDb().collection('authors').find({}).project({ _id: 0, id: 1, name: 1, birthYear: 1 }).toArray();
  return authors;
};

const ensureAuthorIdIndex = async () => {
  await getDb().collection('authors').createIndex({ id: 1 }, { unique: true, collation: { locale: 'simple' } });
};

export const getAuthorById = async (authorId) => {
  return await getDb().collection('authors').findOne(
    { id: authorId },
    { projection: { _id: 0, id: 1, name: 1, birthYear: 1 }, collation: { locale: 'simple' } }
  );
};

export const createAuthor = async ({ id, name, birthYear }) => {
  await ensureAuthorIdIndex();
  try {
    await getDb().collection('authors').insertOne({ id, name, birthYear });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.id === 1) {
      const duplicateError = new Error('Author id already exists');
      duplicateError.code = 'AUTHOR_ID_EXISTS';
      throw duplicateError;
    }
    throw error;
  }
  return { id, name, birthYear };
};

export const updateAuthor = async (authorId, { name, birthYear }) => {
  await ensureAuthorIdIndex();
  return await getDb().collection('authors').findOneAndUpdate(
    { id: authorId },
    { $set: { name, birthYear } },
    {
      returnDocument: 'after',
      includeResultMetadata: false,
      upsert: false,
      projection: { _id: 0, id: 1, name: 1, birthYear: 1 },
      collation: { locale: 'simple' }
    }
  );
};

export const authorHasBooks = async (authorId) => {
  const book = await getDb().collection('books').findOne(
    { authorId },
    { projection: { _id: 1 }, collation: { locale: 'simple' } }
  );
  return book !== null;
};

export const deleteAuthor = async (authorId) => {
  await ensureAuthorIdIndex();
  const result = await getDb().collection('authors').deleteOne(
    { id: authorId },
    { collation: { locale: 'simple' } }
  );
  return result.deletedCount;
};

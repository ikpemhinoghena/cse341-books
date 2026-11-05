import { getDb } from '../db/connect.js';

export const getAllBooks = async () => {
  const books = await getDb().collection('books').find({}).toArray();
  return books;
};

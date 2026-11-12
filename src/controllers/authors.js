import { getAllAuthors as getAllAuthorsFromDb } from '../models/authors.js';
import {
  getAuthorById as getAuthorByIdFromDb,
  createAuthor as createAuthorInDb,
  updateAuthor as updateAuthorInDb,
  deleteAuthor as deleteAuthorFromDb,
  authorHasBooks
} from '../models/authors.js';

export const getAllAuthors = async (req, res) => {
  try {
    const authors = await getAllAuthorsFromDb();
    return res.status(200).json(authors);
  } catch {
    console.error('Failed to retrieve authors.');
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const isValidAuthorBody = (req, updating = false) => {
  const body = req.body;
  if (!req.is('application/json') || !body || typeof body !== 'object' || Array.isArray(body)) {
    return false;
  }
  if (Object.keys(body).some((key) => {
    return !['id', 'name', 'birthYear'].includes(key);
  })) {
    return false;
  }
  if (!updating || Object.hasOwn(body, 'id')) {
    if (typeof body.id !== 'string' || !body.id.trim() || (updating && body.id !== req.params.id)) {
      return false;
    }
  }
  return typeof body.name === 'string' && body.name.trim().length > 0
    && Number.isInteger(body.birthYear) && body.birthYear >= 1
    && body.birthYear <= new Date().getUTCFullYear();
};

export const getAuthorById = async (req, res) => {
  try {
    const author = await getAuthorByIdFromDb(req.params.id);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }
    return res.status(200).json(author);
  } catch {
    console.error('Failed to retrieve author.');
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createAuthor = async (req, res) => {
  try {
    if (!isValidAuthorBody(req)) {
      return res.status(400).json({ message: 'Invalid author data' });
    }
    if (await getAuthorByIdFromDb(req.body.id)) {
      return res.status(400).json({ message: 'Author id already exists' });
    }
    const author = await createAuthorInDb(req.body);
    return res.status(201).json(author);
  } catch (error) {
    if (error.code === 'AUTHOR_ID_EXISTS') {
      return res.status(400).json({ message: 'Author id already exists' });
    }
    console.error('Failed to create author.');
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateAuthor = async (req, res) => {
  try {
    if (!isValidAuthorBody(req, true)) {
      return res.status(400).json({ message: 'Invalid author data' });
    }
    if (!await getAuthorByIdFromDb(req.params.id)) {
      return res.status(404).json({ message: 'Author not found' });
    }
    const author = await updateAuthorInDb(req.params.id, req.body);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }
    return res.status(200).json(author);
  } catch {
    console.error('Failed to update author.');
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteAuthor = async (req, res) => {
  try {
    if (!await getAuthorByIdFromDb(req.params.id)) {
      return res.status(404).json({ message: 'Author not found' });
    }
    if (await authorHasBooks(req.params.id)) {
      return res.status(409).json({ message: 'Cannot delete author while books reference this author' });
    }
    if (!await deleteAuthorFromDb(req.params.id)) {
      return res.status(404).json({ message: 'Author not found' });
    }
    return res.status(204).send();
  } catch {
    console.error('Failed to delete author.');
    return res.status(500).json({ message: 'Internal server error' });
  }
};

import { getAllBooks, getBookById, createBook, updateBook, deleteBook } from '../models/books.js';
import { getAuthorById } from '../models/authors.js';

const isValidPublicationDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const monthLengths = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return year >= 1 && year <= 9999 && month >= 1 && month <= 12
    && day >= 1 && day <= monthLengths[month - 1];
};

const isValidBookBody = (req, updating = false) => {
  const body = req.body;
  if (!req.is('application/json') || !body || typeof body !== 'object' || Array.isArray(body)) {
    return false;
  }
  if (Object.keys(body).some((key) => {
    return !['id', 'authorId', 'title', 'publicationDate'].includes(key);
  })) {
    return false;
  }
  if (!updating || Object.hasOwn(body, 'id')) {
    if (typeof body.id !== 'string' || !body.id.trim() || (updating && body.id !== req.params.id)) {
      return false;
    }
  }
  return typeof body.authorId === 'string' && body.authorId.trim().length > 0
    && typeof body.title === 'string' && body.title.trim().length > 0
    && isValidPublicationDate(body.publicationDate);
};

export const getBooksHandler = async (req, res) => {
  try {
    const books = await getAllBooks();
    return res.status(200).json(books);
  } catch {
    console.error('Failed to retrieve books.');
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getBookByIdHandler = async (req, res) => {
  try {
    const requestedId = req.params.id;
    const book = await getBookById(requestedId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    return res.status(200).json(book);
  } catch {
    console.error('Failed to retrieve book.');
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createBookHandler = async (req, res) => {
  try {
    if (!isValidBookBody(req)) {
      return res.status(400).json({ message: 'Invalid book data' });
    }
    if (await getBookById(req.body.id)) {
      return res.status(400).json({ message: 'Book id already exists' });
    }
    if (!await getAuthorById(req.body.authorId)) {
      return res.status(400).json({ message: 'Author not found' });
    }
    const book = await createBook(req.body);
    return res.status(201).json(book);
  } catch (error) {
    if (error.code === 'BOOK_ID_EXISTS') {
      return res.status(400).json({ message: 'Book id already exists' });
    }
    console.error('Failed to create book.');
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateBookHandler = async (req, res) => {
  try {
    if (!isValidBookBody(req, true)) {
      return res.status(400).json({ message: 'Invalid book data' });
    }
    if (!await getBookById(req.params.id)) {
      return res.status(404).json({ message: 'Book not found' });
    }
    if (!await getAuthorById(req.body.authorId)) {
      return res.status(400).json({ message: 'Author not found' });
    }
    const book = await updateBook(req.params.id, req.body);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    return res.status(200).json(book);
  } catch {
    console.error('Failed to update book.');
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteBookHandler = async (req, res) => {
  try {
    if (!await deleteBook(req.params.id)) {
      return res.status(404).json({ message: 'Book not found' });
    }
    return res.status(204).send();
  } catch {
    console.error('Failed to delete book.');
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const validator = require('validator');

// Create a new book
router.post('/books', async (req, res) => {
  const { title, author, genre, publicationYear, imageUrl, isbn, description } = req.body;

  if (!title || !author) {
    return res.status(400).send({ error: 'Title and author are required' });
  }

  if (isbn && !validator.isISBN(isbn)) {
    return res.status(400).send({ error: 'Invalid ISBN format' });
  }

  try {
    const book = new Book({
      title,
      author,
      genre,
      publicationYear,
      imageUrl: imageUrl || 'https://via.placeholder.com/150',
      isbn,
      description
    });
    await book.save();
    res.status(201).send(book);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get all books
router.get('/books', async (req, res) => {
  try {
    const { genre, author, publicationYear, page = 1, limit = 10 } = req.query;
    const query = {};

    if (genre) query.genre = genre;
    if (author) query.author = author;
    if (publicationYear) query.publicationYear = publicationYear;

    const books = await Book.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.send(books);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get a single book by ID
router.get('/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).send({ error: 'Book not found' });
    }
    res.send(book);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a book by ID
router.put('/books/:id', async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['title', 'author', 'genre', 'publicationYear', 'imageUrl', 'isbn', 'description'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates' });
  }

  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).send({ error: 'Book not found' });
    }

    updates.forEach(update => book[update] = req.body[update]);
    await book.save();
    res.send(book);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a book by ID
router.delete('/books/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).send({ error: 'Book not found' });
    }
    res.send(book);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;

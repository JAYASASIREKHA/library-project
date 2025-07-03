import express from 'express';
import Book from '../models/Book.js';
import Transaction from '../models/BookTransaction.js';

const router = express.Router();

// GET all books
router.get('/', async (req, res, next) => {
  try {
    const books = await Book.find({}, 'bookId bookName authorName copies');
    res.json(books);
  } catch (error) {
    next(error);
  }
});

// GET book details with borrower information by book ID
router.get('/:bookId/details', async (req, res) => {
  try {
    const { bookId } = req.params;
    
    // Find the book
    const book = await Book.findOne({ bookId });
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Find active transactions for this book by bookId
    const transactions = await Transaction.find({
      bookId: book.bookId,
      transactionStatus: 'Active'
    }).select('borrowerName fromDate toDate transactionType');

    res.json({
      book: {
        bookId: book.bookId,
        bookName: book.bookName,
        authorName: book.authorName,
        copies: book.copies
      },
      transactions: transactions
    });
  } catch (error) {
    console.error('Error fetching book details:', error);
    res.status(500).json({ message: 'Failed to fetch book details', error: error.message });
  }
});

// ADD a new book
router.post('/add', async (req, res) => {
  try {
    const { bookId, bookName, authorName, category, copies, bookCountAvailable } = req.body;
    if (!bookId || !bookName || !authorName || !copies) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }
    // Check for duplicate bookId
    const existing = await Book.findOne({ bookId });
    if (existing) {
      return res.status(409).json({ message: 'Book ID already exists. Please use a unique Book ID.' });
    }
    const createdBook = new Book({
      bookId,
      bookName,
      authorName,
      copies,
      categories: category ? [category] : [],
    });
    await createdBook.save();
    res.status(201).json({ message: 'Book added successfully!', book: createdBook });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Book ID already exists. Please use a unique Book ID.' });
    }
    res.status(500).json({ message: 'Failed to add book.', error: error.message });
  }
});

// DELETE a book by book ID
router.delete('/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;

    // Find the book by its MongoDB _id and delete it
    const deletedBook = await Book.findByIdAndDelete(bookId);

    if (!deletedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Failed to delete book.', error: error.message });
  }
});

// UPDATE a book by book ID
router.put('/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;
    const { bookName, authorName, category, copies } = req.body;

    // Try to find the book by either MongoDB _id or bookId
    const updatedBook = await Book.findOneAndUpdate(
      { $or: [{ _id: bookId }, { bookId: bookId }] },
      {
        $set: {
          bookName,
          authorName,
          copies: parseInt(copies),
          categories: category ? [category] : [],
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json({ 
      message: 'Book updated successfully', 
      book: updatedBook 
    });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ 
      message: 'Failed to update book', 
      error: error.message 
    });
  }
});

export default router;

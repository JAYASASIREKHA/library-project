import express from 'express';
import Transaction from '../models/BookTransaction.js';
import Book from '../models/Book.js';
import User from '../models/User.js';

const router = express.Router();

// GET all transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    console.error('❌ Error fetching transactions:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// POST /api/transactions/add
router.post('/add', async (req, res) => {
  try {
    console.log('Received transaction request:', JSON.stringify(req.body, null, 2));
    
    // Extract and validate required fields
    const { bookId, borrowerName, transactionType, fromDate, toDate } = req.body;

    // Validate each field individually
    const validationErrors = {};
    
    if (!bookId || typeof bookId !== 'string' || bookId.trim() === '') {
      validationErrors.bookId = 'Book ID is required and must be a non-empty string';
    }
    if (!borrowerName || typeof borrowerName !== 'string' || borrowerName.trim() === '') {
      validationErrors.borrowerName = 'Borrower name is required and must be a non-empty string';
    }
    if (!transactionType || !['Issued', 'Reserved'].includes(transactionType)) {
      validationErrors.transactionType = 'Transaction type must be either "Issued" or "Reserved"';
    }
    if (!fromDate || typeof fromDate !== 'string' || fromDate.trim() === '') {
      validationErrors.fromDate = 'From date is required and must be a valid date string';
    }
    if (!toDate || typeof toDate !== 'string' || toDate.trim() === '') {
      validationErrors.toDate = 'To date is required and must be a valid date string';
    }

    // If there are validation errors, return them
    if (Object.keys(validationErrors).length > 0) {
      console.log('Validation errors:', validationErrors);
      return res.status(400).json({
        message: 'Validation failed',
        details: validationErrors
      });
    }

    // Find the book by bookId
    const book = await Book.findOne({ bookId: bookId.trim() });
    if (!book) {
      return res.status(404).json({ message: 'Book not found for the given Book ID' });
    }

    // Create new transaction with bookId and bookName
    const newTransaction = new Transaction({
      bookId: book.bookId,
      bookName: book.bookName,
      borrowerName: borrowerName.trim(),
      transactionType,
      fromDate: fromDate.trim(),
      toDate: toDate.trim(),
      transactionStatus: 'Active'
    });

    console.log('Creating new transaction:', JSON.stringify(newTransaction, null, 2));
    
    // Save the transaction
    const savedTransaction = await newTransaction.save();
    console.log('Transaction saved successfully:', JSON.stringify(savedTransaction, null, 2));
    
    return res.status(201).json({
      message: 'Transaction added successfully',
      transaction: savedTransaction
    });
  } catch (err) {
    console.error('❌ Transaction error:', err);
    if (err.name === 'ValidationError') {
      const validationErrors = {};
      for (const field in err.errors) {
        validationErrors[field] = err.errors[field].message;
      }
      return res.status(400).json({
        message: 'Validation failed',
        details: validationErrors
      });
    }
    return res.status(500).json({
      message: 'Internal server error',
      error: err.message
    });
  }
});

// PUT /api/transactions/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Update transaction
    Object.assign(transaction, updateData);
    await transaction.save();

    res.json({
      message: 'Transaction updated successfully',
      transaction
    });
  } catch (err) {
    console.error('❌ Error updating transaction:', err);
    if (err.name === 'ValidationError') {
      const validationErrors = {};
      for (const field in err.errors) {
        validationErrors[field] = err.errors[field].message;
      }
      return res.status(400).json({
        message: 'Validation failed',
        details: validationErrors
      });
    }
    res.status(500).json({
      message: 'Internal server error',
      error: err.message
    });
  }
});

export default router;

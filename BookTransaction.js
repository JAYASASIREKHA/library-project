import mongoose from 'mongoose';

const BookTransactionSchema = new mongoose.Schema({
  bookId: {
    type: String,
    required: true
  },
  bookName: {
    type: String,
    required: true
  },
  borrowerName: {
    type: String,
    required: true
  },
  transactionType: {
    type: String,
    enum: ['Issued', 'Reserved'],
    required: true
  },
  transactionStatus: {
    type: String,
    enum: ['Active', 'Completed'],
    default: 'Active'
  },
  fromDate: {
    type: String,
    required: true
  },
  toDate: {
    type: String,
    required: true
  },
  returnDate: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

const BookTransaction = mongoose.model('BookTransaction', BookTransactionSchema);
export default BookTransaction;

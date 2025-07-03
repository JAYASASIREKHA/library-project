import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
  bookId: { type: String, required: true, unique: true },
  bookName: { type: String, required: true },
  altTitle: { type: String },
  authorName: { type: String, required: true },
  language: { type: String },
  publisher: { type: String },
  copies: { type: Number, required: true },
  categories: [{ type: String }]
});

const Book = mongoose.model('Book', BookSchema);
export default Book;

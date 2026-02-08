import createHttpError from 'http-errors';
import { Note } from '../models/note.js';


export const getAllNotes = async (req, res) => {
  const { page = 1, perPage = 10, tag, search } = req.query;
  const skip = (page - 1) * perPage;

  const notesQuery = Note.find();

  if (req.user && req.user._id) {
    notesQuery.where('userId').equals(req.user._id);
  }

  if (tag) {
    notesQuery.where('tag').equals(tag);
  }

  if (search) {
    notesQuery.where({$text: { $search: search }});
  }

  const totalQuery = Note.countDocuments();

  if (req.user && req.user._id) {
  totalQuery.where('userId').equals(req.user._id);
}

  if (tag) {
    totalQuery.where('tag').equals(tag);
  }

  if (search) {
    totalQuery.where({$text: { $search: search }});
  }
  const [notes, total] = await Promise.all([
    notesQuery.skip(skip).limit(perPage),
    totalQuery
  ]);


  const totalPages = Math.ceil(total / perPage);
  if (page > totalPages && totalPages !== 0) {
    throw createHttpError(400, 'Page number exceeds total pages');
  }



  return res.json({
    page: Number(page),
    perPage: Number(perPage),
    totalNotes: total,
    totalPages: totalPages,
    notes,
  });
};

export const getNoteById = async (req, res, next) => {
  const { noteId } = req.params;
  const note = await Note.findOne({
    _id: noteId,
    userId: req.user._id,
  });
  if (!note) {
    throw createHttpError(404, 'Note not found');
  }

  res.status(200).json({
    data: note,
  });
};

export const createNote = async (req, res) => {
  const note = await Note.create({ ...req.body, userId: req.user._id });
  res.status(201).json({
    data: note,
  });
};

export const deleteNote = async (req, res, next) => {
  const { noteId } = req.params;
  const note = await Note.findOneAndDelete({
    _id: noteId,
    userId: req.user._id,
  });
  if (!note) {
    return next(createHttpError(404, 'Note not found'));
  }
  res.status(200).json({
    data: note,
  });
};

export const updateNote = async (req, res, next) => {
  const { noteId } = req.params;
  const note = await Note.findOneAndUpdate(
    { _id: noteId, userId: req.user._id },
    req.body,
    { new: true }
  );
  if (!note) {
    return next(createHttpError(404, 'Note not found'));
  }
  res.status(200).json({
    data: note,
  });
};




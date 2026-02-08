import createHttpError from 'http-errors';
import { Note } from "../models/note.js";


export const getAllNotes = async (req, res) => {
  const notes = await Note.find();
  res.status(200).json({
    data: notes,
  });
};

export const getNoteById = async(req, res, next) => {
  const { noteId } = req.params;
  const note = await Note.findById(noteId);
  if (!note) {
    throw createHttpError(404, "Note not found");
  }

  res.status(200).json({
    data: note,
  });
};

export const createNote = async (req, res) => {
  const note = await Note.create(req.body);
  res.status(201).json({
    data: note,
  });
};

export const deleteNote = async (req, res, next) => {
  const { noteId } = req.params;
  const note  = await Note.findOneAndDelete({
    _id: noteId,
  });
  if (!note) {
     return next(createHttpError(404, "Note not found"));
  }
  res.status(200).json({
    data: note,
  });
};

export const updateNote = async (req, res,next) => {
  const { noteId } = req.params;
  const note = await Note.findByIdAndUpdate(noteId, req.body, { new: true });
  if (!note) {
      return next(createHttpError(404, "Note not found"));

  }
  res.status(200).json({
    data: note,
  });
};

import createHttpError from "http-errors";
import { Note } from "../models/note.js";

export const getAllNotes = async (req, res) => {
  const { page = 1, perPage = 10, tag, search } = req.query;
  const skip = (page - 1) * perPage;

  let notesQuery = Note.find()
    .where("userId")
    .equals(req.user._id);

  let totalQuery = Note.countDocuments()
    .where("userId")
    .equals(req.user._id);

  if (tag) {
    notesQuery = notesQuery.where("tag").equals(tag);
    totalQuery = totalQuery.where("tag").equals(tag);
  }

  if (search) {
    const regex = new RegExp(search, "i");
    notesQuery = notesQuery.where("title").regex(regex);
    totalQuery = totalQuery.where("title").regex(regex);
  }

  const [notes, total] = await Promise.all([
    notesQuery.skip(skip).limit(perPage),
    totalQuery,
  ]);

  const totalPages = Math.ceil(total / perPage);
  if (page > totalPages && totalPages !== 0) {
    throw createHttpError(400, "Page number exceeds total pages");
  }

  res.json({
    page: Number(page),
    perPage: Number(perPage),
    totalNotes: total,
    totalPages,
    notes,
  });
};

export const getNoteById = async (req, res) => {
  const { noteId } = req.params;

  const note = await Note.findOne()
    .where("_id")
    .equals(noteId)
    .where("userId")
    .equals(req.user._id);

  if (!note) {
    throw createHttpError(404, "Note not found");
  }

  res.status(200).json(note);
};

export const createNote = async (req, res) => {
  const note = await Note.create({
    ...req.body,
    userId: req.user._id,
  });

  res.status(201).json(note);
};

export const deleteNote = async (req, res, next) => {
  const { noteId } = req.params;

  const note = await Note.findOneAndDelete({
    _id: noteId,
    userId: req.user._id,
  });

  if (!note) {
    return next(createHttpError(404, "Note not found"));
  }

  res.status(200).json(note);
};

export const updateNote = async (req, res, next) => {
  const { noteId } = req.params;

  const note = await Note.findOneAndUpdate(
    { _id: noteId, userId: req.user._id },
    req.body,
    { new: true }
  );

  if (!note) {
    return next(createHttpError(404, "Note not found"));
  }

  res.status(200).json(note);
};






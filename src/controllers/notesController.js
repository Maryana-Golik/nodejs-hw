import createHttpError from "http-errors";
import { Note } from "../models/note.js";

export const getAllNotes = async (req, res) => {
  const { page = 1, perPage = 10, tag, search } = req.query;
  const skip = (page - 1) * perPage;

  const notesQuery = Note.find().where("userId").equals(req.user._id);
  const countQuery = Note.countDocuments().where("userId").equals(req.user._id);

  if (tag) {
    notesQuery.where("tag").equals(tag);
    countQuery.where("tag").equals(tag);
  }

  if (search) {
    notesQuery.where({ $text: { $search: search } });
    countQuery.where({ $text: { $search: search } });
  }

  const [notes, total] = await Promise.all([
    notesQuery.skip(skip).limit(perPage),
    countQuery
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
    notes
  });
};

export const getNoteById = async (req, res) => {
  const note = await Note.findOne({
    _id: req.params.noteId,
    userId: req.user._id
  });

  if (!note) {
    throw createHttpError(404, "Note not found");
  }

  res.status(200).json(note);
};

export const createNote = async (req, res) => {
  const note = await Note.create({
    ...req.body,
    userId: req.user._id
  });

  res.status(201).json(note);
};

export const deleteNote = async (req, res) => {
  const note = await Note.findOneAndDelete({
    _id: req.params.noteId,
    userId: req.user._id
  });

  if (!note) {
    throw createHttpError(404, "Note not found");
  }

  res.status(200).json(note);
};

export const updateNote = async (req, res) => {
  const note = await Note.findOneAndUpdate(
    { _id: req.params.noteId, userId: req.user._id },
    req.body,
    { new: true }
  );

  if (!note) {
    throw createHttpError(404, "Note not found");
  }

  res.status(200).json(note);
};











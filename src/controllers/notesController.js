import createHttpError from "http-errors";
import Note from "../models/note.model.js";

export const getAllNotes = async (req, res) => {
  const { page = 1, limit = 10, tags, search } = req.query;
  const skip = (page - 1) * limit;

  let query = Note.find().where("userId").equals(req.user._id);

  if (tags) {
    query = query.where("tags").in(tags.split(","));
  }

  if (search) {
    query = query.find({ $text: { $search: search } });
  }

  const [notes, total] = await Promise.all([
    query.skip(skip).limit(limit).exec(),
    Note.countDocuments(query.getQuery())
  ]);

  res.status(200).json({
    notes,
    total,
    page: Number(page),
    limit: Number(limit)
  });
};

export const getNoteById = async (req, res) => {
  const note = await Note.findOne({
    _id: req.params.id,
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

export const updateNote = async (req, res) => {
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    { new: true }
  );

  if (!note) {
    throw createHttpError(404, "Note not found");
  }

  res.status(200).json(note);
};

export const deleteNote = async (req, res) => {
  const note = await Note.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!note) {
    throw createHttpError(404, "Note not found");
  }

  res.status(204).send();
};







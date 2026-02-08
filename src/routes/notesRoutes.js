import { Router } from "express";
import { createNote, deleteNote, getAllNotes, getNoteById, updateNote } from "../controllers/notesController.js";
import { celebrate } from "celebrate";
import { createNoteSchema, getAllNotesSchema, noteIdSchema, updateNoteSchema } from "../validations/notesValidation.js";
import { authenticate } from "../middleware/authenticate.js";

const notesRouter = Router();

notesRouter.use('/notes', authenticate);

notesRouter.get('/notes', celebrate(getAllNotesSchema), getAllNotes);

notesRouter.get('/notes/:noteId', celebrate(noteIdSchema), getNoteById);

notesRouter.post('/notes', celebrate(createNoteSchema), createNote);

notesRouter.delete('/notes/:noteId', celebrate(noteIdSchema), deleteNote);

notesRouter.patch('/notes/:noteId', celebrate(updateNoteSchema), updateNote);

export default notesRouter;

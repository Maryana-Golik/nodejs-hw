import { Joi, Segments } from "celebrate";
import { TAGS } from "../constants/tags.js";
import { isValidObjectId } from "mongoose";

const validateObjectId = (value) => {
  const isValid = isValidObjectId(value);
  if (!isValid) {
    throw new Error('Invalid ObjectId');
  }
  return value;
};

export const noteIdSchema = {
  [Segments.PARAMS]: Joi.object({
    noteId: Joi.string().required().custom(validateObjectId).messages({
      "any.required": "noteId is required",
      "any.custom": "noteId must be a valid ObjectId",
    })
  })
};

export const getAllNotesSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(5).max(20).default(10),
    tag: Joi.string().valid(...Object.values(TAGS)).optional(),
    search: Joi.string().allow('').trim().optional(),
  })
};

export const createNoteSchema = {
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(1).required(),
    content: Joi.string().allow('').optional(),
    tag: Joi.string().valid(...Object.values(TAGS)).optional(),
  })
};

export const updateNoteSchema = {
  [Segments.PARAMS]: Joi.object({
    noteId: Joi.string().required().custom(validateObjectId).messages({
      "any.required": "noteId is required",
      "any.custom": "noteId must be a valid ObjectId",
    })
  }),
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(1).optional(),
    content: Joi.string().allow('').optional(),
    tag: Joi.string().valid(...Object.values(TAGS)).optional(),
  }).or('title', 'content', 'tag')
};









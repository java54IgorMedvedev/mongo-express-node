import express from 'express';
import Joi from 'joi';
import validate from './middleware/validation.mjs';
import valid from './middleware/valid.mjs';
import asyncHandler from 'express-async-handler';
import MflixService from './service/MflixService.mjs';
import { getError } from './errors/error.mjs';

const app = express();
const port = process.env.PORT || 3500;
const mflixService = new MflixService(process.env.MONGO_URI, process.env.DB_NAME, process.env.MOVIES_COLLECTION, process.env.COMMENTS_COLLECTION);
const server = app.listen(port);

const schemaCommentUpdate = Joi.object({
    commentId: Joi.string().required().messages({
        'string.empty': '"commentId" cannot be empty',
        'any.required': '"commentId" is required',
    }),
    text: Joi.string().required().messages({
        'string.empty': '"text" cannot be empty',
        'any.required': '"text" is required',
    }),
});

const schemaMoviesRated = Joi.object({
    genre: Joi.string().optional(),
    actor: Joi.string().optional(),
    year: Joi.number().integer().optional(),
    amount: Joi.number().integer().min(1).required().messages({
        'number.base': '"amount" must be a number',
        'number.integer': '"amount" must be an integer',
        'any.required': '"amount" is required',
        'number.min': '"amount" must be at least 1',
    }),
});

const schemas = {
    "/mflix/comments": {
        POST: schemaCommentUpdate,
        PUT: schemaCommentUpdate,
    },
    "/mflix/movies/rated": {
        POST: schemaMoviesRated,
    },
};

server.on("listening", () => console.log(`server listening on port ${server.address().port}`));

app.use(express.json());
app.use(validate(schemas));

app.post("/mflix/comments", asyncHandler(async (req, res) => {
    const commentDB = await mflixService.addComment(req.body);
    res.status(201).json(commentDB);
}));

app.put("/mflix/comments", valid, asyncHandler(async (req, res) => {
    const { commentId, text } = req.body;
    const commentUpdated = await mflixService.updateCommentText({ commentId, text });
    res.status(200).json(commentUpdated);
}));

app.delete("/mflix/comments/:id", asyncHandler(async (req, res) => {
    const deletedComment = await mflixService.deleteComment(req.params.id);
    res.status(200).json(deletedComment);
}));

app.get("/mflix/comments/:id", asyncHandler(async (req, res) => {
    const comment = await mflixService.getComment(req.params.id);
    res.status(200).json(comment);
}));

app.post("/mflix/movies/rated", valid, asyncHandler(async (req, res) => {
    const movies = await mflixService.getMostRatedMovies(req.body);
    res.status(200).json(movies);
}));

app.use((error, req, res, next) => {
    const { code = 500, text = `Unknown server error: ${error}` } = error;
    res.status(code).json(getError(code, text));
});

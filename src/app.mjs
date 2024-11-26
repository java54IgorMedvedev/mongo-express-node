import express from 'express';
import MflixService from './service/MflixService.mjs'
const app = express();
const port = process.env.PORT || 3500;
const mflixService = new MflixService(process.env.MONGO_URI, process.env.DB_NAME,
    process.env.MOVIES_COLLECTION, process.env.COMMENTS_COLLECTION)
const server = app.listen(port);
server.on("listening", ()=>console.log(`server listening on port ${server.address().port}`));
app.use(express.json());
app.post("/mflix/comments", async (req, res) => {
    const commentDB = await mflixService.addComment(req.body);
    res.status(201).end(JSON.stringify(commentDB));
});
app.put("/mflix/comments", async (req, res) => {
   try {
       const updatedComment = await mflixService.updateComment(req.body);
       res.status(200).json(updatedComment);
   } catch (error) {
       res.status(400).json({ error: error.message });
   }
});

app.delete("/mflix/comments/:id", async (req, res) => {
   try {
       await mflixService.deleteComment(req.params.id);
       res.status(204).end();
   } catch (error) {
       res.status(400).json({ error: error.message });
   }
});

app.get("/mflix/comments/:id", async (req, res) => {
   try {
       const comment = await mflixService.getComment(req.params.id);
       res.status(200).json(comment);
   } catch (error) {
       res.status(404).json({ error: error.message });
   }
});

app.post("/mflix/movies/rated", async (req, res) => {
   try {
       const movies = await mflixService.findRatedMovies(req.body);
       res.status(200).json(movies);
   } catch (error) {
       res.status(400).json({ error: error.message });
   }
});

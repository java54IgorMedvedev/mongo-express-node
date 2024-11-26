import MongoConnection from '../mongo/MongoConnection.mjs'
import { ObjectId } from 'mongodb'
export default class MflixService {
    #moviesCollection
    #commentsCollection
    #connection
    constructor(uri, dbName, moviesCollection, commentsCollection){
        this.#connection = new MongoConnection(uri, dbName);
        this.#moviesCollection = this.#connection.getCollection(moviesCollection);
        this.#commentsCollection = this.#connection.getCollection(commentsCollection);
        
    }
    shutdown() {
        this.#connection.closeConnection();
    }
    async addComment(commentDto) {
        
        const commentDB = this.#toComment(commentDto);
        const result = await this.#commentsCollection.insertOne(commentDB);
        commentDB._id = result.insertedId;
        return commentDB;
    }
    #toComment(commentDto) {
        const movieId = ObjectId.createFromHexString(commentDto.movie_id);
        return {...commentDto,'movie_id': movieId}
    }
    async updateComment({ commentId, text }) {
        const result = await this.#commentsCollection.updateOne(
            { _id: new ObjectId(commentId) },
            { $set: { text } }
        );
        if (result.matchedCount === 0) {
            throw new Error(`Comment with ID ${commentId} not found`);
        }
        return { _id: commentId, text };
    }
    
    async deleteComment(commentId) {
        const result = await this.#commentsCollection.deleteOne({ _id: new ObjectId(commentId) });
        if (result.deletedCount === 0) {
            throw new Error(`Comment with ID ${commentId} not found`);
        }
    }
    
    async getComment(commentId) {
        const comment = await this.#commentsCollection.findOne({ _id: new ObjectId(commentId) });
        if (!comment) {
            throw new Error(`Comment with ID ${commentId} not found`);
        }
        return comment;
    }
    
    async findRatedMovies({ year, genre, actor, amount }) {
        const query = {};
        if (year) query.year = year;
        if (genre) query.genres = genre;
        if (actor) query.cast = { $regex: actor, $options: "i" };
        const movies = await this.#moviesCollection
            .find(query)
            .sort({ "imdb.rating": -1 })
            .limit(amount)
            .toArray();
        return movies;
    }
    
}
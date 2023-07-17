import express from "express";
import * as redis from 'redis';
import mongoose from "mongoose";
import "dotenv/config";
import _ from "lodash";

const dbName = process.env.DB_NAME;
const redisClient = redis.createClient({
    // socket: {
    //     host: '<hostname>',
    //     port: '<port>'
    // },
    // username: '<username>',
    // password: '<password>'
    // url: ""
});

redisClient.on('error', err => { throw new Error(`Redis Server Error: ${err}`) });

const app = express();
app.use(express.json());

// Mongoose Document Model
const searchAppSchema = new mongoose.Schema({}, { strict: false });

const SearchAppCollection = mongoose.model('search-app', searchAppSchema);
// Connect to MongoDB and start the server
mongoose.connect(`mongodb+srv://AaronBaron:${process.env.MONGO_PASS}@cluster0.syfka.gcp.mongodb.net/?retryWrites=true&w=majority`, {
    dbName,
})
    .then(() => app.listen(3000, () => console.log('Server running at port 3000')))
    .catch((err) => {
        throw new Error(err);
    });


// APIs
// api for search query
app.get('/api/search', async (req, res) => {
    const searchTerm = String(req?.query?.search);

    const results = await SearchAppCollection.find({ $text: { $search: searchTerm } }).lean();
    console.log("search results: ", results);
    res.send(results);

    // comment: // redis isnt up for some reason so going to implement cache on the front end
    // Check if we have it in our cache first
    // if (searchTerm) {
    //     redisClient.get(searchTerm.toLowerCase())
    //         .then(async (cachedData) => {
    //             if (cachedData) {
    //                 console.log('Fetching from cache');
    //                 res.send(JSON.parse(cachedData));
    //             } else {
    //                 console.log('Fetching from mongodb');
    //                 try {
    //                     const results = await SearchAppCollection.find({ $text: { $search: searchTerm } }).lean();
    //                     console.log("search results: ", results)
    //                     // Cache the results for an hour
    //                     redisClient.setEx(searchTerm, 3600, JSON.stringify(results));
    //                     res.send(results);
    //                 } catch (err) {
    //                     console.error('Failed to fetch from database', err);
    //                     res.status(500).send('Server error');
    //                 }
    //             }
    //         })
    //         .catch(err => {
    //             throw new Error(err);
    //         })
    // }
    // else {
    //     throw new Error("no search query provided")
    // }
});

// upload docs
app.post('/api/document', async (req, res) => {
    if (!req.body) return res.status(400).send('No data received');

    try {
        const newDoc = new SearchAppCollection({ ...req.body });
        await newDoc.save();
        console.log(newDoc);
        res.status(201).send(newDoc);
    } catch (err) {
        console.error('Failed to insert document', err);
        res.status(500).send('Server error');
    }
});



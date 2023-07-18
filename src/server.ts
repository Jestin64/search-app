import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import useragent from 'express-useragent';
import helmet from 'helmet';
import _ from "lodash";
import NodeCache from "node-cache";

const dbName = process.env.DB_NAME;
const myCache = new NodeCache();

const app = express();
app.use(express.json());

app.use(cookieParser());

app.use(helmet());
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(
    bodyParser.urlencoded({
        limit: '10mb',
        extended: false,
    }),
);

app.use(useragent.express());

// enable cors
const corsOptions = {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true, // <-- REQUIRED backend setting
};
app.use(cors(corsOptions));
const corObj = cors();
app.options('*', corObj);
app.use(corObj);

// Mongoose Document Model
const searchAppSchema = new mongoose.Schema({
    content: mongoose.Schema.Types.Mixed
}, { strict: false });

// This will create a text index on all fields.
searchAppSchema.index({ "$**": "text" });

const SearchAppCollection = mongoose.model('search-app', searchAppSchema);
// Connect to MongoDB and start the server
mongoose.connect(`mongodb+srv://AaronBaron:${process.env.MONGO_PASS}@cluster0.syfka.gcp.mongodb.net/?retryWrites=true&w=majority`, {
    dbName,
})
    .then(() => app.listen(4000, () => console.log('Server running at port 4000')))
    .catch((err) => {
        throw new Error(err);
    });

// APIs
app.get("/", async (req, res) => {
    console.log("connected to api server: ", req)
    res.send({ message: "connected to api server" })
})
// api for search query
app.get('/api/search', async (req, res) => {
    const searchTerm = String(req?.query?.search);

    // store in cache
    const cacheKey = `search:${searchTerm}`;
    const cacheValue = myCache.get(cacheKey);

    if (cacheValue) {
        // If the results are in the cache, send them
        res.status(200).send(cacheValue);
    } else {
        // If the results are not in the cache, fetch them from the database and store them in the cache
        const result = await SearchAppCollection.find({ $text: { $search: searchTerm } }).lean();
        console.log("search results: ", result);
        res.send(result);
    }
});

// upload docs
app.post('/api/document', async (req, res) => {
    if (!req.body) return res.status(400).send('No data received');

    console.log("req.body:", req.body)

    try {
        const newDoc = new SearchAppCollection(req.body);
        await newDoc.save();
        console.log(newDoc);
        res.status(201).send(newDoc);
    } catch (err) {
        console.error('Failed to insert document', err);
        res.status(500).send('Server error');
    }
});



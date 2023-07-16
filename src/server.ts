import express from "express";
import redis from "redis";
import mongoose from "mongoose";
import "dotenv/config";

// const Document = require('./models/document');
// const redisClient = redis.createClient();

const app = express();
app.use(express.json());

// Connect to MongoDB and start the server
mongoose.connect(`mongodb+srv://AaronBaron:${process.env.MONGO_PASS}@cluster0.syfka.gcp.mongodb.net/?retryWrites=true&w=majority`,{
    dbName: "search-app",
})
    .then(() => app.listen(3000, () => console.log('Server running at port 3000')))
    .catch((err) => {
        throw new Error(err);
    } );


//todo:  once mongoose is up then deprecate this
// app.listen(3000, ()=>{
//     console.log("server started at port 3000")
// })

// app.post('/document', async (req, res) => {
//     const { author, date, name, text } = req.body;

//     const newDocument = new Document({
//         author,
//         date,
//         name,
//         text
//     });

//     await newDocument.save();
    
//     // Invalidate the cache after a new document is added
//     redisClient.flushDb((error, succeeded) => {
//         console.log(succeeded); // will be true if successfull
//     });

//     res.json(newDocument);
// });

// app.get('/search', async (req, res) => {
//     const { keyword } = req.query;

//     // Try getting data from Redis cache first
//     redisClient.get(keyword, async (err, cachedData) => {
//         if (err) throw err;

//         if (cachedData) {
//             // If cachedData exists, send it as response
//             res.send(JSON.parse(cachedData));
//         } else {
//             // If no cachedData, fetch from database and cache it
//             const data = await Document.find({ text: { $regex: keyword } });
            
//             redisClient.setex(keyword, 3600, JSON.stringify(data)); // Cache for 1 hour

//             res.send(data);
//         }
//     });
// });



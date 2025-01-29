import express from 'express';
import {MongoClient, ServerApiVersion} from 'mongodb';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const credentials = JSON.parse(
    fs.readFileSync('./credentials.json')
);

admin.initializeApp({
    credential: admin.credential.cert(credentials)
});

//Each Curly braces{} is a JS object
//Creating an In-Memory DB just for testing server
const articleInfo= [
    {name: 'learn-react', upVotes: 0, comment: []},
    {name: 'learn-node', upVotes: 0, comment: []},
    {name: 'mongodb', upVotes: 0, comment: []}
];

const app = express();
app.use(express.json());

let db;
async function connectToDb() {
    const uri = !process.env.MONGODB_USERNAME ? 'mongodb://127.0.0.1:27017'
    : `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.yxbmi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true
        }
    });

    await client.connect();
    db = client.db('full-stack-react-db');
}

app.get('/hello', function(req, res) {
    res.send("Hello from Get");
});

app.get('/hello/:name', function(req, res) {
    res.send('Hello, '+req.params.name);
});

app.post('/hello', function(req, res) {
    res.send('Hello, ' + req.body.name + ' from Post');
});

//Using MongoDB

//Middleware
app.use(express.static(path.join(__dirname, '../dist')));

//Any endpoint that doesn't start with '/apimd' send that to a static file using regular expression
app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
  
app.get('/apimd/articles/:name', async (req, res) => {
    const {name} = req.params;
    const article = await db.collection('articles').findOne({name});
    res.json(article);
});

app.use(async function (req, res, next) {
    const {authtoken} = req.headers;
    if(authtoken) {
        const user = await admin.auth().verifyIdToken(authtoken);
        //Going forward each request will have 'user' too.
        req.user = user;
        //next() function is used to tell the middleware when 'middleware' is done.
        next();
    }
    else {
        res.sendStatus(400);
    }
});

app.post('/apimd/articles/:name/upvotes', async (req, res) => {
    const {name} = req.params;

    const {uid} = req.user;
    const article = await db.collection('articles').findOne({name});
    const upvoteIds = article.upvoteIds || [];
    const canUpvote = uid && !upvoteIds.includes(uid);

    if(canUpvote) {
        const updatedArticle = await db.collection('articles').findOneAndUpdate({name}, {
            $inc: {upVotes : 1},
            $push: {upvoteIds: uid},
        },
            {returnDocument: "after",
        });
    
        res.json(updatedArticle);
    } else {
        res.sendStatus(403);
    }
});

app.post('/apimd/articles/:name/comment', async (req, res) => {
    const name = req.params.name;
    const {postedBy, comment} = req.body;
    const newComment = {postedBy, comment};

    const updatedArticle = await db.collection('articles'). findOneAndUpdate({name}, {
        $push: {comment: newComment}
    },
        {returnDocument: "after",
    });

    res.json(updatedArticle);
});
//Using MongoDB

//Using arrow function
app.post('/api/articles/:name/upvotes', (req, res) => {
    const article = articleInfo.find(a => a.name === req.params.name);
    article.upVotes += 1;
    res.send('Hoorry! The article '+ req.params.name +' now has '+ article.upVotes +' upVotes!');
    //res.json(article); //to send json object
});

app.post('/api/articles/:name/comment', (req, res) => {
    const name = req.params.name;
    const {postedBy, comment} = req.body;
    const article = articleInfo.find(a => a.name === name);
    article.comment.push({postedBy, comment});
    res.json(article);
});

const PORT = process.env.PORT || 8000;

async function start() {
    await connectToDb();

    app.listen(PORT, function(){
        console.log("Listing on port " +  PORT);
    });
}
start();

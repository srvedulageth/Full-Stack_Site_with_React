import express from 'express';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { DynamoDBClient, UpdateItemCommand, ListTablesCommand, PutItemCommand, GetItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

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

const app = express();
app.use(express.json());

/*
const dynamoDBclient = new DynamoDBClient({
	region: 'us-west-1',
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secreteAccessKey: process.env.AWS_SECRETE_ACCESS_KEY
	}
});
*/

const dynamoDBclient = new DynamoDBClient({
	region: 'us-west-1'
});

const documentClient = DynamoDBDocumentClient.from(dynamoDBclient);

async function updateItem(params) {
  try {
    const data = await documentClient.send(new UpdateCommand(params));
    console.log("Update succeeded:", JSON.stringify(data, null, 2));
    return data;
  } catch (err) {
    console.error("Error updating item:", err);
  }
}

//Middleware
app.use(express.static(path.join(__dirname, '../dist')));

//Any endpoint that doesn't start with '/apimd' send that to a static file using regular expression
app.get(/^(?!\/apimd).+/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
  

app.get('/apimd/articles/:name', async (req, res) => {
    const {name} = req.params;
    console.log({name});
    //const article = await db.collection('articles').findOne({name});

    const command = new ListTablesCommand();
    try {
    	const results = await dynamoDBclient.send(command);
    	console.log({tables: results.TableNames});
    } catch (err) {
    	console.error(err);
    }

	//Key: { name: name }
    const getItemCommand = new GetItemCommand({
	TableName: "full-stack-react-db",
        Key: { "name": {"S": name, } }
    });
    console.log(getItemCommand);

    const article = await dynamoDBclient.send(getItemCommand);
    const item = unmarshall(article.Item);
    console.log(item);

    //res.json(article);
    res.json(item);
});

//Middleware
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

    //const article = await db.collection('articles').findOne({name});
    const getItemCommand = new GetItemCommand({
        TableName: "full-stack-react-db",
        Key: { "name": { "S": name, } }
    });
    let article = await dynamoDBclient.send(getItemCommand);
    let item = unmarshall(article.Item);
    
    let upvoteIds = [];
    upvoteIds = item.upvoteIds;
    const canUpvote = uid && !upvoteIds.includes(uid);
    console.log(item.upVotes);

    if(canUpvote) {
	const tableName = 'full-stack-react-db';
	const key = { name };
	let attributeName1 = 'upVotes';
	let attributeValue1 = item.upVotes+1;
	let attributeName2 = 'upvoteIds';
	let attributeValue2 = upvoteIds;
        upvoteIds.push(uid);

	let params = {
            TableName: tableName,
            Key: key,
	    UpdateExpression: "SET #upVote = :counter, #upVoteIds = :uidarray",
	    ExpressionAttributeNames:{
               "#upVote": attributeName1, "#upVoteIds": attributeName2
            },
            ExpressionAttributeValues:{
               ":counter": attributeValue1, ":uidarray": attributeValue2
            },
	    ReturnValues: "ALL_NEW"
	};
	console.log(params);
	let response = updateItem(params);
	console.log(response);

    	const getItemCommand = new GetItemCommand({
	    TableName: "full-stack-react-db",
	    Key: { "name": { "S": name, } }
    	});
    	let article = await dynamoDBclient.send(getItemCommand);
        let item1 = unmarshall(article.Item);
        console.log('lala 2222'); console.log(item1);

        //res.json(article);
        res.json(item1);
    }
    else {
      res.sendStatus(403);
    }
});

/*
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
*/
//Using DynamoDB

const PORT = process.env.PORT || 8000;

async function start() {
    //await connectToDb();

    app.listen(PORT, function(){
        console.log("Listing on port " +  PORT);
    });
}
start();

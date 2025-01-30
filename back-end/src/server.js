import express from 'express';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { DynamoDBClient, UpdateItemCommand, ListTablesCommand, PutItemCommand, GetItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
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


//Using DynamoDB
async function updateAttribute(tableName, key, attributeName, attributeValue) {
  const params = {
    TableName: tableName,
    Key: key,
    UpdateExpression: 'SET #attr = :val',
    ExpressionAttributeNames: {
      '#attr': attributeName
    },
    ExpressionAttributeValues: {
      ':val': attributeValue
    },
    ReturnValues: 'UPDATED_NEW'
  };
  
  console.log(params);
  const command = new UpdateItemCommand(params);
  try {
    const result = await dynamoDBclient.send(command);
    return result.Attributes;
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
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
    const article = await dynamoDBclient.send(getItemCommand);
    const item = unmarshall(article.Item);
    
    const upvoteIds = item.upvoteIds;
    const canUpvote = uid && !upvoteIds.includes(uid);
    console.log(item.upVotes);

    if(canUpvote) {
	//Update upVotes
	const tableName = 'full-stack-react-db';
	const key = { "name": { "S": name, } };
	const attributeName = 'upVotes';
	const attributeValue = item.upVotes+1;

        updateAttribute(tableName, key, attributeName, attributeValue)
        .then(result => console.log('Attribute updated:', result))
        .catch(error => console.error('Error:', error));

	//Update upvoteIds
        push.upvoteIds(uid);
        console.log(upvoteIds);
	const attributeName1 = 'upvoteIds';
	const attributeValue1 = upvoteIds;

        updateAttribute(tableName, key, attributeName1, attributeValue1)
        .then(result => console.log('Attribute updated:', result))
        .catch(error => console.error('Error:', error));
	 
    	const getItemCommand = new GetItemCommand({
	    TableName: "full-stack-react-db",
	    Key: { "name": { "S": name, } }
    	});
    	const article = await dynamoDBclient.send(getItemCommand);
        res.json(article);
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

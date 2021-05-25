// connect to mongo path 
// C:\Program Files\MongoDB\Server\4.4\bin
// type 'mongod' to start terminal
// then type in a different terminal 'mongo' to run the db

import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import path from 'path';

const app = express();

app.use(express.static(path.join(__dirname, '/build')))
app.use(bodyParser.json());

const withDB = async (operations, res) => {
    try{
   const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true })
   const db = client.db('mytech-blog');

   await operations(db);

   client.close();
    }
    catch(error){
        res.status(500).json({ message:'Error connecting to db, error' });

    }
}

// get route
app.get('/api/articles/:name', async (req, res) => {
    withDB(async (db) => {
    const articleName = req.params.name;

   const articleInfo = await db.collection('articles').findOne({ name: articleName });
   res.status(200).json(articleInfo);
 
    }, res)
        
})

//likes end point
app.post('/api/articles/:name/likes', async (req, res) => {

    withDB(async (db) => {
        const articleName = req.params.name;


        const articleInfo = await db.collection('articles').findOne({ name: articleName});
     
        await db.collection('articles').updateOne({ name: articleName }, {
            '$set': {
                likes: articleInfo.likes + 1,    
        },
     })
     const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName});
     
     res.status(200).json(updatedArticleInfo)
          
    }, res)
   
});


//comments route
app.post('/api/articles/:name/add-comment', (req, res) => {
    const { username, text } = req.body;
    const articleName = req.params.name;

   withDB(async (db) => {
       const articleInfo = await db.collection('articles').findOne({ name: articleName });
       await db.collection('articles').updateOne({ name: articleName}, {
           '$set': {
               comments: articleInfo.comments.concat({ username, text })
           },
       });
       const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName});

       res.status(200).json(updatedArticleInfo);
   }, res);
} );

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'));
})

app.listen(8000, () => console.log('listening on port 8000'))
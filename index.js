const express = require('express')
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId =require('mongodb').ObjectId;
const { query } = require('express');
const port = process.env.PORT || 5000;



//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4scxf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run(){
    try{
        await client.connect();
        const database = client.db('life_fitness');
        const productsCollection = database.collection('products');
        const userOrders = database.collection('orders');
        const userReviews = database.collection('reviews');
        const usersCollection = database.collection('users')

        //
      app.get('/products', async (req,res) => {
        const cursor = productsCollection.find({});
        const products = await cursor.toArray();
        res.json(products)
      });

      //delete product
      app.delete('/products/:id', async (req,res) => {
        const id = req.params.id;
        const query={_id: ObjectId(id)};
        const result= await productsCollection.deleteOne(query);
        res.json(result)
    });
    
      
      app.post('/orders', async (req,res) => {
        const order =req.body;
        const result= await userOrders.insertOne(order);
        // console.log(result)
        res.json(result)
    });

    //add product
      app.post('/products', async (req,res) => {
        const order =req.body;
        const result= await productsCollection.insertOne(order);
        console.log(result)
        res.json(result)
    });

    // post review
      app.post('/reviews', async (req,res) => {
        const order =req.body;
        const result= await userReviews.insertOne(order);
        // console.log(result)
        res.json(result)
    });

    // app.get('/orders', async (req,res) => {
    //   const email= req.query.email;
    //   const query = {email: email}
    //   const cursor = userOrders.find(query);
    //   const orders = await cursor.toArray();
    //   res.json(orders)
    // });
    

    //all orders
    app.get('/orders', async (req,res) => {
      const cursor = userOrders.find({});
      const products = await cursor.toArray();
      res.json(products)
    })
    
    app.get('/reviews', async (req,res) => {
      const cursor = userReviews.find({});
      const reviews = await cursor.toArray();
      res.json(reviews)
    });


    //delete orders
    app.delete('/orders/:id', async (req,res) => {
      const id = req.params.id;
      const query={_id: ObjectId(id)};
      const result= await userOrders.deleteOne(query);
      res.json(result)
  });


   //updating orders
   app.put('/orders/:id', async (req,res)=> {
    const id =req.params.id;
    const updatedItem = req.body;
    const filter= {_id: ObjectId(id)};
    console.log(filter);
    
    const options = {upsert: true};
    const updateDoc = {
      $set: {
        status: updatedItem.status
      }
    };
    const result= await userOrders.updateOne(filter, updateDoc, options);
    res.json(result)
});

  //save user data
   app.post('/users', async (req,res) => {
          const user = req.body;
          const result = await usersCollection.insertOne(user);
          console.log(result)
          res.send(result)
        });


        app.get('/users/:email', async (req,res) => {
            const email = req.params.email;
            const query = {email: email};
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin'){
              isAdmin =true;
            }
            res.json({admin: isAdmin})
          })

        //update user data
        app.put('/users', async (req,res) => {
            const user= req.body;
            const filter = {email: user.email};
            const options = { upsert: true };
            const updateDoc = {$set: user};
            const result = await usersCollection.updateOne(filter,updateDoc,options);
            res.json(result);
          });


          app.put('/users/admin', async (req,res) => {
            const user = req.body;
            const filter = {email: user.email};
            const updateDoc = {$set: 
            user,};
            const options = { upsert: true };
            const result = await usersCollection.updateOne(filter, updateDoc,options);
            console.log(user, result)
            res.json(result);
        });

        
        
    }
    finally{
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello home gym portal server!')
  })
  
  app.listen(port, () => {
    console.log('server running', port)
  })
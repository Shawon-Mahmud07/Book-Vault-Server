const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
var cors = require("cors");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xtqtqqh.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // Get the database and collection on which to run the operation
    const bookCollections = client.db("BookInventory").collection("books");
    const storeCollections = client.db("BookInventory").collection("store");
    const storeProductsCollections = client
      .db("BookInventory")
      .collection("storeProducts");

    // Insert a book to the DB: post method
    app.post("/upload-book", async (req, res) => {
      const data = req.body;
      const result = await bookCollections.insertOne(data);
      res.send(result);
    });

    // Insert "create store" info to the DB: post method
    app.post("/create-store", async (req, res) => {
      const data = req.body;
      const result = await storeCollections.insertOne(data);
      res.send(result);
    });
    // add store product info to the DB: post method
    app.post("/upload-product", async (req, res) => {
      const data = req.body;
      const result = await storeProductsCollections.insertOne(data);
      res.send(result);
    });

    // get user store info from the database
    app.get("/user-store", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await storeCollections.find(query).toArray();
      res.send(result);
    });

    // get all product from the database
    app.get("/all-product", async (req, res) => {
      const result = await storeProductsCollections.find().toArray();
      res.send(result);
    });
    // get all books from the database
    app.get("/all-books", async (req, res) => {
      const result = await bookCollections.find().toArray();
      res.send(result);
    });
    //get single product by id using get method
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await storeProductsCollections.findOne(query);
      res.send(result);
    });
    // Update single product by id using put method
    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const newUpdateBook = req.body;
      const options = { upsert: true };
      const updateProduct = {
        $set: {
          product_Name: newUpdateBook.product_Name,
          location: newUpdateBook.location,
          photo: newUpdateBook.photo,
          description: newUpdateBook.description,
          quantity: newUpdateBook.quantity,
          product_Cost: newUpdateBook.product_Cost,
          profit_Margin: newUpdateBook.profit_Margin,
          discount: newUpdateBook.discount,
        },
      };
      const result = await storeProductsCollections.updateOne(
        filter,
        updateProduct,
        options
      );
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

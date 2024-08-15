const express = require('express');
const app = express()
require('dotenv').config()
const cors = require('cors');
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ha1geqx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        const productsCollection = client.db('practiceDB').collection('Products')


        app.get('/products', async (req, res) => {
            const size = parseInt(req.query.size)
            const page = parseInt(req.query.page) - 1
            console.log('page:', page, size);
            const result = await productsCollection.find().sort({ date: -1 }).skip(page * size)
                .limit(size).toArray()

            res.send(result)
        })


        app.get('/product-count', async (req, res) => {
            const count = await productsCollection.countDocuments()
            res.send({ count })
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Prodecta is Running')
})

app.listen(port, () => {
    console.log(`Prodecta is Running on port: ${port}`);
})
const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ha1geqx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

client.connect();

const productsCollection = client.db('practiceDB').collection('Products');

app.get('/products', async (req, res) => {
    const size = parseInt(req.query.size);
    const page = parseInt(req.query.page) - 1;
    const search = req.query.search || '';
    const sort = req.query.sort || 'asc';
    const sortByDate = req.query.sortByDate === 'true';
    const filter = req.query.filter
    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || Infinity;


    let query = {};
    if (search.trim() !== '') {
        query = {
            Product_Name: { $regex: search, $options: 'i' }
        };
    }
    if(filter) query = {Category:filter}

    if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        query.Price = { $gte: minPrice, $lte: maxPrice };
    }

    let sortOption = {};
    if (sortByDate) {
        sortOption = { date: sort === 'asc' ? 1 : -1 };
    } else {
        sortOption = { Price: sort === 'asc' ? 1 : -1 };
    }

    const options = { sort: sortOption };

    const result = await productsCollection.find(query, options)
        .skip(page * size)
        .limit(size)
        .toArray();

    res.send(result);
});

app.get('/product-count', async (req, res) => {
    const count = await productsCollection.countDocuments();
    res.send({ count });
});

app.get('/', (req, res) => {
    res.send('Prodecta is Running');
});

app.listen(port, () => {
    console.log(`Prodecta is Running on port: ${port}`);
});

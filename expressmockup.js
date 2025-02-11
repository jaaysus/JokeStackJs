const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const csvParser = require('csv-parser');
const app = express();

app.use(cors()); 
app.use(express.json());

const csvFilePath = path.join(__dirname, 'products.csv');

function readProductsFromCSV() {
  const products = [];
  fs.createReadStream(csvFilePath)
    .pipe(csvParser())
    .on('data', (row) => {
      products.push({
        id: parseInt(row.id),
        name: row.name,
        price: parseFloat(row.price),
      });
    })
    .on('end', () => {
      console.log('CSV file successfully processed');
    });
  return products;
}

function writeProductsToCSV(products) {
  const ws = fs.createWriteStream(csvFilePath);
  const csvStream = csv.format({ headers: true });
  csvStream.pipe(ws);
  products.forEach(product => {
    csvStream.write(product);
  });
  csvStream.end();
}

let products = readProductsFromCSV();  


app.get('/products', (req, res) => {
  res.json(products);
});


app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).send('Product not found');
  res.json(product);
});


app.post('/products', (req, res) => {
  const { name, price } = req.body;
  const newProduct = {
    id: products.length + 1,
    name,
    price,
  };
  products.push(newProduct);
  writeProductsToCSV(products);  
  res.status(201).json(newProduct);
});


app.put('/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).send('Product not found');
  
  const { name, price } = req.body;
  product.name = name || product.name;
  product.price = price || product.price;

  writeProductsToCSV(products);  
  res.json(product);
});


app.delete('/products/:id', (req, res) => {
  const productIndex = products.findIndex(p => p.id === parseInt(req.params.id));
  if (productIndex === -1) return res.status(404).send('Product not found');
  
  products.splice(productIndex, 1);
  writeProductsToCSV(products);  
  res.status(204).send();
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (acts as our database)
let products = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 1999,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
  },
  {
    id: 2,
    name: "Running Shoes",
    price: 2499,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"
  },
  {
    id: 3,
    name: "Backpack",
    price: 1299,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400"
  }
];

let nextId = 4; // Auto-increment ID counter

// ─────────────────────────────────────────
// GET /products → fetch all products
// ─────────────────────────────────────────
app.get('/products', (req, res) => {
  res.json(products);
});

// ─────────────────────────────────────────
// POST /products → add a new product
// ─────────────────────────────────────────
app.post('/products', (req, res) => {
  const { name, price, image } = req.body;

  // Validation
  if (!name || !price || !image) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (isNaN(price) || Number(price) <= 0) {
    return res.status(400).json({ error: 'Price must be a positive number' });
  }

  const newProduct = {
    id: nextId++,
    name: name.trim(),
    price: Number(price),
    image: image.trim()
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// ─────────────────────────────────────────
// PUT /products/:id → update a product
// ─────────────────────────────────────────
app.put('/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, price, image } = req.body;

  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Validation
  if (!name || !price || !image) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (isNaN(price) || Number(price) <= 0) {
    return res.status(400).json({ error: 'Price must be a positive number' });
  }

  products[index] = {
    id,
    name: name.trim(),
    price: Number(price),
    image: image.trim()
  };

  res.json(products[index]);
});

// ─────────────────────────────────────────
// DELETE /products/:id → delete a product
// ─────────────────────────────────────────
app.delete('/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  products.splice(index, 1);
  res.json({ message: 'Product deleted successfully' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
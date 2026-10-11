const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory or database-backed product catalog
const products = [
  { id: "ratnagiri-alphonso", name: "Ratnagiri Alphonso", variety: "Hapus mangoes", price: 549, unit: "1 kg box", category: "mangoes", inSeason: true, badge: "Peak season" },
  { id: "banganapalli-mango", name: "Banganapalli Mango", variety: "Golden mango", price: 149, unit: "1 kg", category: "mangoes", inSeason: true, badge: "Farm favourite" },
  { id: "kesar-mango", name: "Kesar Mango", variety: "Saffron mango", price: 189, unit: "1 kg", category: "mangoes", inSeason: true, badge: "Aromatic" },
  { id: "nagpur-orange", name: "Nagpur Orange", variety: "Sweet citrus", price: 249, unit: "1 kg bag", category: "citrus", inSeason: true, badge: "Winter harvest" },
  { id: "kinnow", name: "Kinnow", variety: "Punjab mandarin", price: 199, unit: "1 kg", category: "citrus", inSeason: true, badge: "Juicy" },
  { id: "strawberry", name: "Strawberry", variety: "Mahabaleshwar berry", price: 299, unit: "250 g box", category: "berries", inSeason: true, badge: "Limited" },
  { id: "nashik-grapes", name: "Green Seedless Grapes", variety: "Nashik grapes", price: 219, unit: "1 kg", category: "berries", inSeason: true, badge: "Crisp" },
  { id: "watermelon", name: "Watermelon", variety: "Red-flesh melon", price: 99, unit: "1 kg", category: "melons", inSeason: true, badge: "Summer cooler" },
  { id: "shimla-apple", name: "Shimla Apple", variety: "Himachal apple", price: 299, unit: "1 kg", category: "apples", inSeason: true, badge: "Orchard fresh" },
  { id: "robusta-banana", name: "Robusta Banana", variety: "Everyday banana", price: 89, unit: "1 dozen", category: "everyday", inSeason: true, badge: "Everyday" },
  { id: "pomegranate", name: "Pomegranate", variety: "Bhagwa pomegranate", price: 299, unit: "1 kg", category: "everyday", inSeason: true, badge: "Ruby arils" },
  { id: "dragon-fruit", name: "Dragon Fruit", variety: "Pink dragon fruit", price: 349, unit: "1 kg", category: "exotic", inSeason: true, badge: "Vivid & crisp" }
];

let cart = [];
let orders = [];

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Harvest & Hue Express API", timestamp: new Date().toISOString() });
});

// Products API
app.get("/api/products", (req, res) => {
  const { category, inSeason } = req.query;
  let result = products;
  if (category) {
    result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  if (inSeason === "true") {
    result = result.filter(p => p.inSeason);
  }
  res.json({ ok: true, count: result.length, products: result });
});

app.get("/api/products/:id", (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ ok: false, error: "Product not found" });
  }
  res.json({ ok: true, product });
});

// Cart API
app.get("/api/cart", (req, res) => {
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  res.json({ ok: true, items: cart, total });
});

app.post("/api/cart", (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ ok: false, error: "Product not found" });
  }
  const existing = cart.find(item => item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, name: product.name, price: product.price, quantity });
  }
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  res.json({ ok: true, message: `${product.name} added to cart`, items: cart, total });
});

app.delete("/api/cart/:productId", (req, res) => {
  cart = cart.filter(item => item.productId !== req.params.productId);
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  res.json({ ok: true, items: cart, total });
});

// Checkout / Order API
app.post("/api/checkout", (req, res) => {
  if (cart.length === 0) {
    return res.status(400).json({ ok: false, error: "Cart is empty" });
  }
  const order = {
    orderId: "ORD-" + Date.now(),
    items: [...cart],
    total: cart.reduce((acc, item) => acc + (item.price * item.quantity), 0),
    status: "CONFIRMED",
    createdAt: new Date().toISOString()
  };
  orders.push(order);
  cart = [];
  res.json({ ok: true, message: "Order placed successfully", order });
});

app.get("/api/orders", (req, res) => {
  res.json({ ok: true, orders });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Express backend server running on port ${PORT}`);
});

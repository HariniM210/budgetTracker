// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
const PORT = 5000;
const DATA_FILE = "transactions.json";

app.use(cors());
app.use(bodyParser.json());

// Load transactions from file (or empty array if file doesn't exist)
let transactions = [];
if (fs.existsSync(DATA_FILE)) {
  try {
    transactions = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    transactions = [];
  }
}

// Save transactions to file
function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(transactions, null, 2));
}

// Get all transactions
app.get("/transactions", (req, res) => {
  res.json(transactions);
});

// Add new transaction
app.post("/transactions", (req, res) => {
  const { type, description, amount } = req.body;
  if (!type || !description || isNaN(amount)) {
    return res.status(400).json({ error: "Invalid transaction data" });
  }
  const newTx = {
    id: Date.now().toString(),
    type,
    description,
    amount: parseFloat(amount),
    date: new Date().toISOString()
  };
  transactions.push(newTx);
  saveData();
  res.json(newTx);
});

// Delete transaction
app.delete("/transactions/:id", (req, res) => {
  const id = req.params.id;
  transactions = transactions.filter(t => t.id !== id);
  saveData();
  res.json({ deleted: id });
});

// Update transaction
app.put("/transactions/:id", (req, res) => {
  const id = req.params.id;
  const { type, description, amount } = req.body;
  const tx = transactions.find(t => t.id === id);
  if (!tx) return res.status(404).json({ error: "Transaction not found" });

  tx.type = type || tx.type;
  tx.description = description || tx.description;
  if (!isNaN(amount)) tx.amount = parseFloat(amount);
  tx.date = new Date().toISOString();

  saveData();
  res.json(tx);
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});

const express = require("express");
const cors = require("cors");
const Joi = require("joi");

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(cors());

let transactions = [
  { _id: 1, date: "04/23", merchant: "Coffee Shop", category: "Food", amount: -4.0 },
  { _id: 2, date: "04/22", merchant: "Grocery Store", category: "Shopping", amount: -38.2 },
  { _id: 3, date: "04/21", merchant: "Public Transit", category: "Transport", amount: -2.5 },
  { _id: 4, date: "04/19", merchant: "Paycheck", category: "Income", amount: 500.0 },
  { _id: 5, date: "04/18", merchant: "Gas Station", category: "Transport", amount: -42.75 },
  { _id: 6, date: "04/17", merchant: "Food Delivery", category: "Food", amount: -12.32 },
  { _id: 7, date: "04/16", merchant: "Online Store", category: "Shopping", amount: -89.99 },
  { _id: 8, date: "04/15", merchant: "Streaming Service", category: "Entertainment", amount: -14.99 },
  { _id: 9, date: "04/14", merchant: "Gym Membership", category: "Health", amount: -35.0 },
  { _id: 10, date: "04/12", merchant: "Credit Card Payment", category: "Payments", amount: -800.0 },
  { _id: 11, date: "04/10", merchant: "Bookstore", category: "Shopping", amount: -22.4 },
  { _id: 12, date: "04/08", merchant: "Restaurant", category: "Food", amount: -46.75 },
  { _id: 13, date: "04/06", merchant: "Electric Bill", category: "Utilities", amount: -120.0 },
  { _id: 14, date: "04/05", merchant: "Freelance Payment", category: "Income", amount: 320.0 },
  { _id: 15, date: "04/02", merchant: "Pharmacy", category: "Health", amount: -18.65 },
];

const transactionSchema = Joi.object({
  date: Joi.string()
    .pattern(/^\d{2}\/\d{2}$/)
    .required()
    .messages({
      "string.empty": "Date is required",
      "string.pattern.base": "Date must be in MM/DD format",
      "any.required": "Date is required",
    }),
  merchant: Joi.string()
    .min(2)
    .required()
    .messages({
      "string.empty": "Merchant is required",
      "string.min": "Merchant must be at least 2 characters",
      "any.required": "Merchant is required",
    }),
  category: Joi.string()
    .min(2)
    .required()
    .messages({
      "string.empty": "Category is required",
      "string.min": "Category must be at least 2 characters",
      "any.required": "Category is required",
    }),
  amount: Joi.number()
    .required()
    .messages({
      "number.base": "Amount must be a number",
      "any.required": "Amount is required",
    }),
});

const validateTransaction = (transaction) =>
  transactionSchema.validate(transaction, { abortEarly: false });

const getNextId = () => {
  if (transactions.length === 0) return 1;
  return Math.max(...transactions.map((transaction) => Number(transaction._id))) + 1;
};

app.get("/api/transactions", (req, res) => {
  res.json(transactions);
});

app.get("/api/transactions/:id", (req, res) => {
  const id = String(req.params.id);
  const transaction = transactions.find((t) => String(t._id) === id);

  if (!transaction) {
    return res.status(404).json({ success: false, message: "Transaction not found" });
  }

  res.json(transaction);
});

app.post("/api/transactions", (req, res) => {
  const { error } = validateTransaction(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  const transaction = {
    _id: getNextId(),
    date: req.body.date.trim(),
    merchant: req.body.merchant.trim(),
    category: req.body.category.trim(),
    amount: Number(req.body.amount),
  };

  transactions.push(transaction);
  res.status(201).json({ success: true, data: transaction });
});

app.put("/api/transactions/:id", (req, res) => {
  const id = String(req.params.id);
  const index = transactions.findIndex((t) => String(t._id) === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Transaction not found",
    });
  }

  const { error } = validateTransaction(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  const updatedTransaction = {
    _id: transactions[index]._id,
    date: req.body.date.trim(),
    merchant: req.body.merchant.trim(),
    category: req.body.category.trim(),
    amount: Number(req.body.amount),
  };

  transactions[index] = updatedTransaction;

  res.status(200).json({
    success: true,
    data: updatedTransaction,
  });
});

app.delete("/api/transactions/:id", (req, res) => {
  const id = String(req.params.id);
  const index = transactions.findIndex((t) => String(t._id) === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Transaction not found",
    });
  }

  const deletedTransaction = transactions[index];
  transactions.splice(index, 1);

  res.status(200).json({
    success: true,
    data: deletedTransaction,
  });
});

const port = process.env.PORT || 3001;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is up and running on ${port}`);
});
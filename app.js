const express = require("express");
const cors = require("cors");
const Joi = require("joi");

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(cors());

let transactions = [
  { _id: 1, date: "04/23", dateKey: 423, merchant: "Coffee Shop", category: "Food", amount: -4.0 },
  { _id: 2, date: "04/22", dateKey: 422, merchant: "Grocery Store", category: "Shopping", amount: -38.2 },
  { _id: 3, date: "04/21", dateKey: 421, merchant: "Public Transit", category: "Transport", amount: -2.5 },
  { _id: 4, date: "04/19", dateKey: 419, merchant: "Paycheck", category: "Income", amount: 500.0 },
  { _id: 5, date: "04/18", dateKey: 418, merchant: "Gas Station", category: "Transport", amount: -42.75 },
  { _id: 6, date: "04/17", dateKey: 417, merchant: "Food Delivery", category: "Food", amount: -12.32 },
  { _id: 7, date: "04/16", dateKey: 416, merchant: "Online Store", category: "Shopping", amount: -89.99 },
  { _id: 8, date: "04/15", dateKey: 415, merchant: "Streaming Service", category: "Entertainment", amount: -14.99 },
  { _id: 9, date: "04/14", dateKey: 414, merchant: "Gym Membership", category: "Health", amount: -35.0 },
  { _id: 10, date: "04/12", dateKey: 412, merchant: "Credit Card Payment", category: "Payments", amount: -800.0 },
  { _id: 11, date: "04/10", dateKey: 410, merchant: "Bookstore", category: "Shopping", amount: -22.4 },
  { _id: 12, date: "04/08", dateKey: 408, merchant: "Restaurant", category: "Food", amount: -46.75 },
  { _id: 13, date: "04/06", dateKey: 406, merchant: "Electric Bill", category: "Utilities", amount: -120.0 },
  { _id: 14, date: "04/05", dateKey: 405, merchant: "Freelance Payment", category: "Income", amount: 320.0 },
  { _id: 15, date: "04/02", dateKey: 402, merchant: "Pharmacy", category: "Health", amount: -18.65 },
];

app.get("/api/transactions", (req, res) => {
  res.send(transactions);
});

app.get("/api/transactions/:id", (req, res) => {
  const transaction = transactions.find((t) => t._id === parseInt(req.params.id));
  res.send(transaction);
});

app.post("/api/transactions", (req, res) => {
  const result = validateTransaction(req.body);

  if (result.error) {
    return res.status(400).send(result.error.details[0].message);
  }

  const transaction = {
    _id: transactions.length + 1,
    date: req.body.date,
    dateKey: req.body.dateKey,
    merchant: req.body.merchant,
    category: req.body.category,
    amount: req.body.amount,
  };

  transactions.push(transaction);
  res.status(200).send(transaction);
});

const validateTransaction = (transaction) => {
  const schema = Joi.object({
    _id: Joi.allow(""),
    date: Joi.string().required(),
    dateKey: Joi.number().required(),
    merchant: Joi.string().min(2).required(),
    category: Joi.string().min(2).required(),
    amount: Joi.number().required(),
  });

  return schema.validate(transaction);
};

const port = process.env.PORT || 3001;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is up and running on ${port}`);
});
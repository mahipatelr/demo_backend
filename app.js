require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Joi = require("joi");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(express.static("public"));
app.use("/uploads", express.static(uploadsDir));
app.use(express.json());
app.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const transactionMongooseSchema = new mongoose.Schema({
  originalId: { type: Number, default: null },
  date: { type: String, required: true },
  merchant: { type: String, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  image: { type: String, default: "" },
});

const Transaction = mongoose.model("Transaction", transactionMongooseSchema);

const seedTransactions = [
  { originalId: 1, date: "04/23", merchant: "Coffee Shop", category: "Food", amount: -4.0, image: "" },
  { originalId: 2, date: "04/22", merchant: "Grocery Store", category: "Shopping", amount: -38.2, image: "" },
  { originalId: 3, date: "04/21", merchant: "Public Transit", category: "Transport", amount: -2.5, image: "" },
  { originalId: 4, date: "04/19", merchant: "Paycheck", category: "Income", amount: 500.0, image: "" },
  { originalId: 5, date: "04/18", merchant: "Gas Station", category: "Transport", amount: -42.75, image: "" },
  { originalId: 6, date: "04/17", merchant: "Food Delivery", category: "Food", amount: -12.32, image: "" },
  { originalId: 7, date: "04/16", merchant: "Online Store", category: "Shopping", amount: -89.99, image: "" },
  { originalId: 8, date: "04/15", merchant: "Streaming Service", category: "Entertainment", amount: -14.99, image: "" },
  { originalId: 9, date: "04/14", merchant: "Gym Membership", category: "Health", amount: -35.0, image: "" },
  { originalId: 10, date: "04/12", merchant: "Credit Card Payment", category: "Payments", amount: -800.0, image: "" },
  { originalId: 11, date: "04/10", merchant: "Bookstore", category: "Shopping", amount: -22.4, image: "" },
  { originalId: 12, date: "04/08", merchant: "Restaurant", category: "Food", amount: -46.75, image: "" },
  { originalId: 13, date: "04/06", merchant: "Electric Bill", category: "Utilities", amount: -120.0, image: "" },
  { originalId: 14, date: "04/05", merchant: "Freelance Payment", category: "Income", amount: 320.0, image: "" },
  { originalId: 15, date: "04/02", merchant: "Pharmacy", category: "Health", amount: -18.65, image: "" },
];

const transactionSchema = Joi.object({
  date: Joi.string().pattern(/^\d{2}\/\d{2}$/).required(),
  merchant: Joi.string().min(2).required(),
  category: Joi.string().min(2).required(),
  amount: Joi.number().required(),
});

const validateTransaction = (transaction) =>
  transactionSchema.validate(transaction, { abortEarly: false });

const seedDatabase = async () => {
  for (const item of seedTransactions) {
    const existing = await Transaction.findOne({ originalId: item.originalId });
    if (!existing) {
      await Transaction.create(item);
    }
  }
};

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    await seedDatabase();

    app.listen(process.env.PORT || 3001, "0.0.0.0", () => {
      console.log(`Server is up and running on ${process.env.PORT || 3001}`);
    });
  } catch (err) {
    console.log("MongoDB connection error:", err);
  }
};

app.get("/api/transactions", async (req, res) => {
  try {
    const data = await Transaction.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/transactions", upload.single("image"), async (req, res) => {
  const { error } = validateTransaction(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  try {
    const newTransaction = new Transaction({
      originalId: null,
      date: req.body.date.trim(),
      merchant: req.body.merchant.trim(),
      category: req.body.category.trim(),
      amount: Number(req.body.amount),
      image: req.file ? req.file.filename : "",
    });

    const savedTransaction = await newTransaction.save();

    res.status(201).json({
      success: true,
      data: savedTransaction,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

app.put("/api/transactions/:id", upload.single("image"), async (req, res) => {
  const { error } = validateTransaction(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  try {
    const existing = await Transaction.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        date: req.body.date.trim(),
        merchant: req.body.merchant.trim(),
        category: req.body.category.trim(),
        amount: Number(req.body.amount),
        image: req.file ? req.file.filename : existing.image,
        originalId: existing.originalId,
      },
      { new: true }
    );

    res.json({
      success: true,
      data: updatedTransaction,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

app.delete("/api/transactions/:id", async (req, res) => {
  try {
    const deleted = await Transaction.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      data: deleted,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

startServer();
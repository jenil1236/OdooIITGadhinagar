import Expense from '../models/expense.js';
import User from "../models/user.js";
import History from "../models/history.js";
import axios from "axios";
import countryToCurrency from "country-to-currency";
import getSymbolFromCurrency from "currency-symbol-map";

async function convertCurrency(amount, from, to) {
  const url = `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`;
  const { data } = await axios.get(url);
  return data.result;
}

 const createExpense = async (req, res) => {
  try {
    const { description, category, amount, currency, date, paidBy, remarks } = req.body;

    // Fetch user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // 1. Get target currency from user's country
    const targetCurrency = countryToCurrency[user.country]; // e.g. "INR"
    if (!targetCurrency) {
      return res.status(400).json({ message: "Could not find currency for user's country" });
    }

    // 2. Get currency symbol
    const targetSymbol = getSymbolFromCurrency(targetCurrency) || targetCurrency;

    // 3. Convert amount
    const convertedAmount = await convertCurrency(amount, currency, targetCurrency);

    // Create expense
    const newExpense = new Expense({
      employee: req.user._id,
      description,
      category,
      amount,
      currency, // original currency
      date,
      paidBy,
      remarks,
      company: user.companyId,
      approvalFlow: user.approvalFlow,
      convertedAmount,
      convertedCurrency: targetCurrency,
      convertedSymbol: targetSymbol
    });

    await newExpense.save();

    res.status(201).json({
      message: "Expense created successfully",
      expense: newExpense
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error creating expense" });
  }
};


const getExpense = async (req, res) => {
  try {
    const id = req.params.id;
    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const id = req.params.id;
    const expense = await Expense.findByIdAndDelete(id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createExpense, getExpense, updateExpense, deleteExpense };
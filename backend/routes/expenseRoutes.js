import express from 'express';
import authMiddleware from "../middlewares/auth.js";
import {
    addExpense,
    deleteExpense,
    downloadExpenseExcel,
    getAllExpense, getExpenseOverview,
    updateExpense
} from "../controllers/expenseController.js";

const expenseRouter = express.Router();

expenseRouter.post("/add", authMiddleware, addExpense)
expenseRouter.get("/get", authMiddleware, getAllExpense)
expenseRouter.put("/update/:id", authMiddleware, updateExpense)
expenseRouter.get("/downloadExcel", authMiddleware, downloadExpenseExcel)
expenseRouter.delete("/delete/:id", authMiddleware, deleteExpense)
expenseRouter.get("/overview", authMiddleware, getExpenseOverview)

export default expenseRouter

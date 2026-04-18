import ExpenseModel from "../models/expenseModel.js"
import XLSX from "xlsx";
import getDataRange from "../utils/dateFilter.js";

//ADD EXPENSE
export async function addExpense(req, res) {
    const userId = req.user._id
    const {description, amount, category, date} = req.body
    try {
        if (!description || amount === undefined || amount === null || !category || !date) {
            return res.status(400).json({
                success: false,
                message: 'Todos os campos são requeridos',
            })
        }
        const newExpense = new ExpenseModel({
            userId,
            description,
            amount,
            category,
            date: new Date(date),
        })
        await newExpense.save()
        return res.status(201).json({
            success: true,
            message: 'Lançamento criado com sucesso!',
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Erro no servidor!",
        })
    }
}

//GET ALL EXPENSES
export async function getAllExpense(req, res) {
    const userId = req.user._id
    try {
        const expenses = await ExpenseModel.find({ userId }).sort({ date: -1 })
        res.json(expenses)
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Erro no servidor!",
        })
    }
}

// UPDATE AN EXPENSE
export async function updateExpense(req, res) {
    const id = req.params.id
    const userId = req.user._id
    const {description, amount} = req.body
    try {
        const updatedExpense = await ExpenseModel.findOneAndUpdate(
            { _id: id, userId },
            { description, amount },
            { new: true, runValidators: true },
        )
        if (!updatedExpense) {
            return res.status(404).json({
                success: false,
                message: "Lançamento não encontrado."
            })
        }
        return res.json({
            success: true,
            message: "Lançamento atualizado com sucesso!",
            data: updatedExpense
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Erro no servidor!",
        })
    }
}

// DELETE AN EXPENSE
export async function deleteExpense(req, res) {
    const userId = req.user._id
    try {
        const expense = await ExpenseModel.findOneAndDelete({ _id: req.params.id, userId })
        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Lançamento não encontrado.",
            })
        }
        return res.json({
            success: true,
            message: "Lançamento removido com sucesso!",
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Erro no servidor!",
        })
    }
}

// DOWNLOAD DATA FOR EXCEL FILES
export async function downloadExpenseExcel(req, res) {
    const userId = req.user._id
    try {
        const expense = await ExpenseModel.find({ userId }).sort({ date: -1 })
        const plainData = expense.map((exp) => ({
            Description: exp.description,
            Amount: exp.amount,
            Category: exp.category,
            Date: new Date(exp.date).toLocaleDateString(),
        }))
        const worksheet = XLSX.utils.json_to_sheet(plainData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "expenseModel");
        const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        res.setHeader("Content-Disposition", 'attachment; filename="expense_details.xlsx"');
        return res.send(buffer)
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Erro no servidor!",
        })
    }
}

// GET EXPENSE OVERVIEW
export async function getExpenseOverview(req, res) {
    try {
        const userId = req.user._id
        const { range = "yearly" } = req.query
        const { start, end } = getDataRange(range)
        const expenses = await ExpenseModel.find({
            userId,
            date: { $gte: start, $lte: end },
        }).sort({ date: -1 })
        const totalExpense = expenses.reduce((acc, cur) => acc + cur.amount, 0)
        const averageExpense = expenses.length > 0 ? totalExpense / expenses.length : 0
        const numberOfTransactions = expenses.length
        const recentTransactions = expenses.slice(0, 5)
        return res.json({
            success: true,
            data: {
                totalExpense,
                averageExpense,
                numberOfTransactions,
                recentTransactions,
                range
            }
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Erro no servidor!",
        })
    }
}

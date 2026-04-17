import IncomeModel from "../models/incomeModel.js"
import XLSX from "xlsx";
import getDataRange from "../utils/dateFilter.js";

//ADD INCOME
export async function addIncome(req, res) {
    const userId = req.user._id
    const {description, amount, category, date} = req.body
    try {
        if (!description || amount === undefined || amount === null || !category || !date) {
            res.status(400).json({
                success: false,
                message: 'Todos os campos são requeridos',
            })
        }
        const newIncome = new IncomeModel({
            userId,
            description,
            amount,
            category,
            date: new Date(date),
        })
        await newIncome.save()
        res.status(201).json({
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

//GET ALL INCOMES
export async function getAllIncome(req, res) {
    const userId = req.user._id
    try {
        const incomes = await IncomeModel.find({ userId }).sort({ date: -1 })
        res.json(incomes)
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Erro no servidor!",
        })
    }
}

// UPDATE AN INCOME
export async function updateIncome(req, res) {
    const id = req.params.id
    const userId = req.user._id
    const {description, amount} = req.body
    try {
        const updatedIncome = await IncomeModel.findByIdAndUpdate(
            { _id: id, userId },
            { description, amount },
            { new: true, runValidators: true },
        )
        if (!updatedIncome) {
            return res.status(404).json({
                success: false,
                message: "Lançamento não encontrado."
            })
        }
        return res.json({
            success: true,
            message: "Lançamento atualizado com sucesso!",
            data: updatedIncome
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Erro no servidor!",
        })
    }
}

// DELETE AN INCOME
export async function deleteIncome(req, res) {
    const userId = req.user._id
    try {
        const income = await IncomeModel.findByIdAndDelete({ _id: req.params.id, userId })
        if (!income) {
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
export async function downloadIncomeExcel(req, res) {
    const userId = req.user._id
    try {
        const income = await IncomeModel.find({ userId }).sort({ date: -1 })
        const plainData = income.map((inc) => ({
            Description: inc.description,
            Amount: inc.amount,
            Category: inc.category,
            Date: new Date(inc.date).toLocaleDateString(),
        }))
        const worksheet = XLSX.utils.json_to_sheet(plainData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "incomeModel");
        const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        res.setHeader("Content-Disposition", 'attachment; filename="income_details.xlsx"');
        return res.send(buffer)
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Erro no servidor!",
        })
    }
}

// GET INCOME OVERVIEW
export async function getIncomeOverview(req, res) {
    try {
        const userId = req.user._id
        const { range = "yearly" } = req.query
        const { start, end } = getDataRange(range)
        const incomes = await IncomeModel.find({
            userId,
            date: { $gte: start, $lte: end },
        }).sort({ date: -1 })
        const totalIncome = incomes.reduce((acc, cur) => acc + cur.amount, 0)
        const averageIncome = incomes.length > 0 ? totalIncome / incomes.length : 0
        const numberOfTransactions = incomes.length
        const recentTransactions = incomes.slice(0, 9)
        return res.json({
            success: true,
            data: {
                totalIncome,
                averageIncome,
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

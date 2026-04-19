import { styles } from "../assets/dummyStyles.js";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";
import {useEffect, useMemo, useState} from "react";
import {
    Activity, ArrowDown,
    ArrowUp,
    Car,
    CreditCard,
    DollarSign,
    Gift,
    Home,
    PiggyBank,
    ShoppingCart,
    Utensils,
    Zap
} from "lucide-react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const CATEGORY_ICONS = {
    Alimentação: <Utensils className="w-4 h-4" />,
    Manutenção: <Home className="w-4 h-4" />,
    Transporte: <Car className="w-4 h-4" />,
    Compras: <ShoppingCart className="w-4 h-4" />,
    Lazer: <Gift className="w-4 h-4" />,
    Utilidades: <Zap className="w-4 h-4" />,
    Saúde: <Activity className="w-4 h-4" />,
    Sálario: <ArrowUp className="w-4 h-4" />,
    Impostos: <CreditCard className="w-4 h-4" />,
    Investimnto: <PiggyBank className="w-4 h-4" />,
}

// To Filter
const filterTransactions = (transactions, frame) => {
    const now = new Date();
    const today = new Date(now).setHours(0,0,0,0);

    switch (frame) {
        case "daily":
            return transactions.filter((t) => new Date(t.date) >= today)
        case "weekly": {
            const startOfWeek = new Date(today)
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
            return transactions.filter((t) => new Date(t.date) >= startOfWeek)
        }
        case "monthly":
            return transactions.filter((t) => new Date(t.date).getMonth() === now.getMonth())
        case "yearly":
            return transactions.filter((t) => new Date(t.date).getFullYear() === now.getFullYear())
        default:
            return transactions;
    }
}

const safeArrayFromResponse = (res) => {
    const body = res?.data;
    if (!body) return [];
    if (Array.isArray(body)) return body;
    if (Array.isArray(body.data)) return body.data;
    if (Array.isArray(body.incomes)) return body.incomes;
    if (Array.isArray(body.expenses)) return body.expenses;
    return []
}

const Layout = ({onLogout, user}) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [timeFrame, setTimeFrame] = useState("yearly");
    const [loading, setLoading] = useState(false)
    const [showAllTransactions, setShowAllTransactions] = useState(false)
    const [lastUpdated, setLastUpdated] = useState(new Date());

    // To Fetch The Transactions From The Server side
    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const [incomeRes, expenseRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/income/get`, { headers }),
                axios.get(`${API_BASE_URL}/expense/get`, { headers }),
            ])

            const incomes = safeArrayFromResponse(incomeRes).map((i) => ({
                ...i,
                type: "income",
            }));

            const expenses = safeArrayFromResponse(expenseRes).map((e) => ({
                ...e,
                type: "expense",
            }));

            const allTransactions = [...incomes, ...expenses].map((t) => ({
                id: t._id || t.id || t.id_str || Math.random().toString(36).slice(2),
                description: t.description || t.title || t.note || "",
                amount: t.amount !== null ? Number(t.amount) : Number(t.value) || 0,
                date: t.date || t.createdAt || new Date().toDateString(),
                category: t.category || t.type || "Outras",
                type: t.type,
                raw: t,
            })).sort((a, b) => new Date(b.date) - new Date(a.date))

            setTransactions(allTransactions);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Falha ao carregar as transações", error?.response || error.message || error);
        } finally {
            setLoading(false);
        }
    }

    // To Add Transaction Either Income Or Expense
    const addTransaction = async (transaction) => {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const endpoint = transaction.type === "income" ? "income/add" : "expense/add";
            await axios.post(`${API_BASE_URL}/${endpoint}`, transaction,{ headers })
            await fetchTransactions()
            return true
        } catch (error) {
            console.error("Falha ao adicionar uma transação", error?.response || error.message || error);
            throw error
        }
    }

    // To Edit Transaction Either Income Or Expense
    const editTransaction = async (id, transaction) => {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const endpoint = transaction.type === "income" ? "income/update" : "expense/update";
            await axios.put(`${API_BASE_URL}/${endpoint}/${id}`, transaction,{ headers })
            await fetchTransactions()
            return true
        } catch (error) {
            console.error("Falha ao editar uma transação", error?.response || error.message || error);
            throw error
        }
    }

    // To Delete Transaction Either Income Or Expense
    const deleteTransaction = async (id, type) => {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const endpoint = type === "income" ? "income/delete" : "expense/delete";
            await axios.put(`${API_BASE_URL}/${endpoint}/${id}`,{ headers })
            await fetchTransactions()
            return true
        } catch (error) {
            console.error("Falha ao removrr uma transação", error?.response || error.message || error);
            throw error
        }
    }

    useEffect(() => {
        fetchTransactions();
    }, []);

    const filteredTransactions = useMemo(
        () => filterTransactions(transactions, timeFrame), [transactions, timeFrame]);

    // Get Stats At Long The Time
    const stats = useMemo(() => {
        const now = new Date()
        const thirtyDayAgo = new Date(now)
        thirtyDayAgo.setDate(now.getDate() - 30)

        const last30DaysTransactions = transactions.filter(
            (t) => new Date(t.date) >= thirtyDayAgo
        )

        const last30DaysIncomes = last30DaysTransactions.filter(
            (t) => t.type === "income"
        ).reduce((sum, t) => sum + Number(t.amount), 0)

        const last30DaysExpenses = last30DaysTransactions.filter(
            (t) => t.type === "expense"
        ).reduce((sum, t) => sum + Number(t.amount), 0)

        const allTimeIncomes = transactions.filter(
            (t) => t.type === "income"
        ).reduce((sum, t) => sum + Number(t.amount), 0)

        const allTimeExpenses = transactions.filter(
            (t) => t.type === "expense"
        ).reduce((sum, t) => sum + Number(t.amount), 0)

        const savingsRate = last30DaysIncomes > 0
            ? Math.round(
                ((last30DaysIncomes - last30DaysExpenses) / last30DaysIncomes) * 100
            ) : 0

        const last60DaysAgo = new Date(now)
        last60DaysAgo.setDate(now.getDate() - 60)

        const previous30DaysTransactions = transactions.filter(
            (t) => {
                const date = new Date(t.date)
                return date >= last60DaysAgo && date < thirtyDayAgo
            }
        )

        const previous30DaysExpenses = previous30DaysTransactions.filter(
            (t) => t.type === "expense"
        ).reduce((sum, t) => sum + Number(t.amount), 0)

        const expenseChange = previous30DaysExpenses > 0
            ? Math.round(
                ((last30DaysExpenses - previous30DaysExpenses) / previous30DaysExpenses) * 100
            ) : 0

        return {
            totalTransactions: transactions.length,
            last30DaysIncomes,
            last30DaysExpenses,
            last30DaysSavings: last30DaysIncomes - last30DaysExpenses,
            allTimeIncomes,
            allTimeExpenses,
            allTimesSavings: allTimeIncomes - allTimeExpenses,
            last30DaysCount: last30DaysTransactions.length,
            savingsRate,
            expenseChange,
        }
    }, [transactions])

    const timeFrameLabel = useMemo(
        () =>
            timeFrame === "daily"
                ? "Hoje"
                : timeFrame === "weekly"
                ? "Esta Semana"
                : "Esse Mês",
        [timeFrame],
    )

    const outletContext = {
        transactions: filteredTransactions,
        addTransaction,
        editTransaction,
        deleteTransaction,
        refreshTransactions: fetchTransactions,
        timeFrame,
        setTimeFrame,
        lastUpdated,
    }

    const getSavingsRating = (rate) => rate > 30 ? "Excelente" : rate > 20 ? "Bom" : "Necessita melhorar"

    // To Filter Categories
    const topCategories = useMemo(
        () =>
            Object.entries(
                transactions
                    .filter((t) => t.type === "expense")
                    .reduce((acc, t) => {
                        acc[t.category] = (acc[t.category] || 0) + Number(t.amount)
                        return acc
                    }, {})
            ).sort((a, b) => b[1] - a[1]).slice(0, 5),
            [transactions]
    )

    const displayedTransactions = showAllTransactions ? transactions : transactions.slice(0, 4)

    return (
        <div className={styles.layout.root}>
            <Navbar user={user} onLogout={onLogout} />
            <Sidebar user={user} onLogout={onLogout} isCollapsed={sidebarCollapsed} setIsCollapsed={setSidebarCollapsed} />
            <div className={styles.layout.mainContainer(sidebarCollapsed)}>
                <div className={styles.header.container}>
                    <div>
                        <h1 className={styles.header.title}>Dashboard</h1>
                        <p className={styles.header.subtitle}>Bemvindo de volta</p>
                    </div>
                </div>
                <div className={styles.statCards.grid}>
                    <div className={styles.statCards.card}>
                        <div className={styles.statCards.cardHeader}>
                            <div>
                                <p className={styles.statCards.cardTitle}>Saldo</p>
                                <p className={styles.statCards.cardValue}>
                                    R$ {stats.allTimesSavings.toLocaleString("pt-Br", {maximumFractionDigits: 2})}
                                </p>
                            </div>
                            <div className={styles.statCards.iconContainer("teal")}>
                                <DollarSign className={styles.statCards.icon("teal")} />
                            </div>
                        </div>
                        <p className={styles.statCards.cardFooter}>
                            <span className="text-teal-600 font-medium">
                                +R$ {stats.last30DaysSavings.toLocaleString("pt-Br", {maximumFractionDigits: 2})}
                            </span>{" "}
                            Esse Mês
                        </p>
                    </div>

                    {/* For Income */}
                    <div className={styles.statCards.card}>
                        <div className={styles.statCards.cardHeader}>
                            <div>
                                <p className={styles.statCards.cardTitle}>Receita Mensal</p>
                                <p className={styles.statCards.cardValue}>
                                    R$ {stats.last30DaysIncomes.toLocaleString("pt-Br", {maximumFractionDigits: 2})}
                                </p>
                            </div>
                            <div className={styles.statCards.iconContainer("green")}>
                                <ArrowUp className={styles.statCards.icon("green")} />
                            </div>
                        </div>
                        <p className={styles.statCards.cardFooter}>
                            <span className="text-green-600 font-medium">
                                +12,5%
                            </span>{" "}
                            No ùltimo Mês
                        </p>
                    </div>

                    {/* For Expense */}
                    <div className={styles.statCards.card}>
                        <div className={styles.statCards.cardHeader}>
                            <div>
                                <p className={styles.statCards.cardTitle}>Despesas Mensais</p>
                                <p className={styles.statCards.cardValue}>
                                    R$ {stats.last30DaysExpenses.toLocaleString("pt-Br", {maximumFractionDigits: 2})}
                                </p>
                            </div>
                            <div className={styles.statCards.iconContainer("orange")}>
                                <ArrowDown className={styles.statCards.icon("orange")} />
                            </div>
                        </div>
                        <p className={styles.statCards.cardFooter}>
                            <span className={`${styles.colors.expenseChange(stats.expenseChange)} font-medium`}>
                                +R$ {stats.expenseChange > 0 ? "+"  : ""}
                                {stats.expenseChange}%
                            </span>{" "}
                            Esse Mês
                        </p>
                    </div>

                    {/* For Savings */}
                    <div className={styles.statCards.card}>
                        <div className={styles.statCards.cardHeader}>
                            <div>
                                <p className={styles.statCards.cardTitle}>Investimentos</p>
                                <p className={styles.statCards.cardValue}>
                                    {stats.savingsRate}%
                                </p>
                            </div>
                            <div className={styles.statCards.iconContainer("blue")}>
                                <PiggyBank className={styles.statCards.icon("blue")} />
                            </div>
                        </div>
                        <p className={styles.statCards.cardFooter}>
                            {getSavingsRating(stats.savingsRate)}
                            Esse Mês
                        </p>
                    </div>
                </div>

                
            </div>
        </div>
    )
}

export default Layout

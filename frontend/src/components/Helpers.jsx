export const getTimeFrameRange = (timeFrame) => {
    const now = Date.now()
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)

    if (timeFrame === "daily") {
        return { start, end: new Date(now), label: "Diário" }
    }

    if (timeFrame === "weekly") {
        const startOfWeek = new Date(start)
        startOfWeek.setDate(start.getDate() - start.getDay())
        startOfWeek.setHours(0, 0, 0, 0)
        return { start: startOfWeek, end: new Date(now), label: "Esta Semana" }
    }

    if (timeFrame === "monthly") {
        const startOfMonth = new Date(start.getFullYear(), start.getMonth(), 1)
        return { start: startOfMonth, end: new Date(now), label: "Este Mês" }
    }

    if (timeFrame === "yearly") {
        const startOfYear = new Date(start.getFullYear(), 0, 1)
        startOfYear.setHours(0, 0, 0, 0)
        return { start: startOfYear, end: new Date(now), label: "Este Ano" }
    }

    const startOfYear = new Date(start.getFullYear(), 0, 1)
    startOfYear.setHours(0, 0, 0, 0)
    return { start: startOfYear, end: new Date(now), label: "Este Ano" }
}

export const getPreviousTimeFrameRange = (timeFrame) => {
    const now = Date.now()
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)

    if (timeFrame === "daily") {
        const yesterday = new Date(start)
        yesterday.setDate(start.getDate() - 1)
        const end = new Date(
            yesterday.getFullYear(),
            yesterday.getMonth(),
            yesterday.getDate(),
            23,
            59,
            59,
            999
        )
        return { start: yesterday, end, label: "Ontem" }
    }

    if (timeFrame === "weekly") {
        const startOfLastWeek = new Date(start)
        startOfLastWeek.setDate(start.getDate() - start.getDay() - 7)
        startOfLastWeek.setHours(0, 0, 0, 0)

        const endOfLastWeek = new Date(startOfLastWeek)
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 6)
        endOfLastWeek.setHours(23, 59, 59, 999)

        return { start: startOfLastWeek, end: endOfLastWeek, label: "ùltima Semana" }
    }

    if (timeFrame === "monthly") {
        const startOfLastMonth = new Date(
            start.getFullYear(),
            start.getMonth() - 1,
        )
        startOfLastMonth.setHours(0, 0, 0, 0)

        const endOfLastMonth = new Date(
            start.getFullYear(),
            start.getMonth(),
            0
        )
        endOfLastMonth.setHours(23, 59, 59, 999)

        return { start: startOfLastMonth, end: endOfLastMonth, label: "ùltimo Mês" }
    }

    if (timeFrame === "yearly") {
        const startOfLastYear = new Date(start.getFullYear() - 1, 0, 1)
        startOfLastYear.setHours(0, 0, 0, 0)
        const endOfLastYear = new Date(
            start.getFullYear() - 1,
            11,
            31,
            23,
            59,
            59,
            999
        )

        return { start: startOfLastYear, end: endOfLastYear, label: "ùltimo Ano" }
    }

    const startOfLastYear = new Date(start.getFullYear() - 1, 0, 1)
    startOfLastYear.setHours(0, 0, 0, 0)
    const endOfLastYear = new Date(
        start.getFullYear() - 1,
        11,
        31,
        23,
        59,
        59,
        999
    )

    return { start: startOfLastYear, end: endOfLastYear, label: "ùltimo Ano" }
}

export const calculateData = (transactions) => {
    const totals = transactions.reduce(
        (data, t) => {
            const amt = Number(t.amount) || 0
            if (t.type === "income") {
                data.income = amt
            } else {
                data.expense = amt
            }
            return data
        }, { income: 0, expense: 0 })
    return { ...totals, savings: totals.income - totals.expense }
}

export const generateChartPoints = (timeFrame) => {
    const now = Date.now()
    const points = []

    if (timeFrame === "daily") {
        for (let i = 0; i < 24; i++) {
            const hour = new Date(now)
            hour.setHours(i, 0, 0, 0)
            points.push({
                date: hour,
                label: hour.toLocaleTimeString([], { hour: "2-digit" }),
                hour: i,
                isCurrent: i === now.getHours(),
            })
        }
    } else if (timeFrame === "weekly") {
        const start = new Date(now)
        start.setDate(now.getDate() - now.getDay())
        start.setHours(0, 0, 0, 0)

        for (let i = 0; i < 7; i++) {
            const day = new Date(start)
            day.setDate(start.getDate() + i)
            points.push({
                date: day,
                label: day.toLocaleDateString("pt-BR", { weekday: "short" }),
                isCurrent: day.getDate() && day.getMonth() === now.getMonth(),
            })
        }
    } else if (timeFrame === "monthly") {
        const start = new Date(now.getFullYear(), now.getMonth(), 1)
        const daysInMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0
        ).getDate()

        for (let i = 0; i < daysInMonth; i++) {
            const day = new Date(now.getFullYear(), now.getMonth(), 1)
            day.setDate(start.getDate() + i)
            points.push({
                date: day,
                label: day.toLocaleDateString("pt-BR", { day: "numeric" }),
                isCurrent: i === now.getDate(),
            })
        }
    } else {
        for (let i = 0; i < 12; i++) {
            const month = new Date(now.getFullYear(), i, 1)
            points.push({
                date: month,
                label: month.toLocaleDateString("pt-BR", { month: "short" }),
                isCurrent: i === now.getMonth(),
            })
        }

    }

    return points
}

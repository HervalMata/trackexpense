import { modalStyles } from "../assets/dummyStyles.js";
import {X} from "lucide-react";

const AddTransactionModal = ({
    showModal,
    setShowModal,
    newTransaction,
    setNewTransaction,
    handleAddTransaction,
    type = "both",
    title = "Adicionar novo Lançamento",
    buttonText = "Adicionar Lançamento",
    categories = ["Salário", "Adicionais", "Hora Extra", "PLR", "Férias", "Outros", "FGTS", "Impostos", "Previdência", "Saúde", "Sindicato", "Empréstimos"],
    color = "teal"
}) => {
    if (!showModal) return null
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentDate = today.toISOString().split("T")[0]
    const minDate = `${currentYear}-01-01`
    const colorClass = modalStyles.colorClasses[color]

    const handleNewTransaction = () => {
        return null
    }

    return (
        <div className={modalStyles.overlay}>
            <div className={modalStyles.modalContainer}>
                <div className={modalStyles.modalHeader}>
                    <h3 className={modalStyles.modalTitle}>
                        {title}
                    </h3>
                    <button
                        onClick={() => setShowModal(false)}
                        className={modalStyles.closeButton}
                    >
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={(e) => {
                    e.preventDefault()
                    handleNewTransaction()
                }}>
                    <div className={modalStyles.form}>
                        <div>
                            <label className={modalStyles.label}>Descrição</label>
                            <input
                                type="text"
                                value={newTransaction.description}
                                onChange={(e) => {
                                    setNewTransaction((prev) => ({
                                        ...prev,
                                        description: e.target.value
                                    }))
                                }}
                                className={modalStyles.input(colorClass.ring)}
                                placeholder={
                                    type === "both"
                                        ? "Salário, ATN, Turno 100%"
                                        : "IRPF, Petros, INSS"
                                }
                                required
                            />
                        </div>
                        <div>
                            <label className={modalStyles.label}>Valor</label>
                            <input
                                type="number"
                                value={newTransaction.amount}
                                onChange={(e) => {
                                    setNewTransaction((prev) => ({
                                        ...prev,
                                        amount: e.target.value
                                    }))
                                }}
                                className={modalStyles.input(colorClass.ring)}
                                placeholder="0.00"
                                required
                            />
                        </div>
                        {type === "both" && (
                            <div>
                                <label className={modalStyles.label}>Tipo</label>
                                <div className={modalStyles.typeButtonContainer}>
                                    <button
                                        type="button"
                                        className={modalStyles.typeButton(
                                            newTransaction.type === 'income',
                                            modalStyles.colorClasses.teal.typeButtonSelected
                                        )}
                                        onClick={() => setNewTransaction((prev) => ({ ...prev, type: 'income' }))}
                                    >
                                        Receitas
                                    </button>
                                    <button
                                        type="button"
                                        className={modalStyles.typeButton(
                                            newTransaction.type === 'expense',
                                            modalStyles.colorClasses.teal.typeButtonSelected
                                        )}
                                        onClick={() => setNewTransaction((prev) => ({ ...prev, type: 'expense' }))}
                                    >
                                        Descontos
                                    </button>
                                </div>
                            </div>
                        )}
                        <div>
                            <label className={modalStyles.label}>Categoria</label>
                            <select
                                value={newTransaction.categories} onChange={(e) => {
                                setNewTransaction((prev) => ({
                                        ...prev,
                                        categories: e.target.value
                                    }))
                                }}
                                className={modalStyles.input(colorClass.ring)}
                            >
                                {categories.map((category) => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={modalStyles.label}>Data</label>
                            <input
                                type="date"
                                value={newTransaction.date}
                                onChange={(e) => {
                                    setNewTransaction((prev) => ({
                                        ...prev,
                                        date: e.target.value
                                    }))
                                }}
                                className={modalStyles.input(colorClass.ring)}
                                min={minDate}
                                max={currentDate}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className={modalStyles.submitButton(colorClass.button)}
                        >
                            {buttonText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}


export default AddTransactionModal

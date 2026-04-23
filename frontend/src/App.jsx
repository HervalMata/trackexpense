"use client"

import {Navigate, Route, Routes, useLocation, useNavigate} from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Layout from "./components/Layout.jsx";
import {useState, useEffect} from "react";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import axios from "axios";

const DEFAULT_API_URL = import.meta.env.VITE_API_BASE_URL

// To Get Transactions From LocalStorage
const getTransactionsFromStorage = () => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : [];
}

//To Protect The Routes
/*const ProtectedRoute = ({user, children}) => {
    const localToken = localStorage.getItem("token");
    const sessionToken = sessionStorage.getItem("token");
    const hasToken = localToken || sessionToken;

    if (!user || !hasToken) {
        return <Navigate to="/login" replace />;
    }
    return children
}*/

// To Scroll To Top When Page Gets Reload Or New Page Is Visited
const ScrollTop = () => {
    const location = useLocation();
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, [location.pathname]);
    return null
}

const App = () => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [transactions, setTransactions] = useState(() => {
        try {
            return getTransactionsFromStorage()
        } catch (txError) {
            console.error("Erro ao carregar os lançamentos", txError)
        }
    })
    const navigate = useNavigate();

    const clearAuth = () => {
        try {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            sessionStorage.removeItem("user");
            sessionStorage.removeItem("token");
        } catch (error) {
            console.error("Erro no clearAuth", error);
        }
        setUser(null);
        setToken(null);
    }

    // To Save The Token
    const persistAuth = (userObj,tokenStr, remember = false) => {
        try {
            if (remember) {
                if (userObj) localStorage.setItem("user", JSON.stringify(userObj));
                if (tokenStr) localStorage.setItem("token", tokenStr);
                sessionStorage.removeItem("user");
                sessionStorage.removeItem("token");
            } else {
                if (userObj) sessionStorage.setItem("user", JSON.stringify(userObj));
                if (tokenStr) sessionStorage.setItem("token", tokenStr);
                localStorage.removeItem("user");
                localStorage.removeItem("token");
            }
            setUser(userObj || null);
            setToken(tokenStr || null);
        } catch (error) {
            console.error("Erro no persistAuth", error);
        }
    }

    // To Update User Data Both In State And Storage
    const updateUserData = (updatedUser) => {
        setUser(updatedUser)
        const localToken = localStorage.getItem("token");
        const sessionToken = sessionStorage.getItem("token");
        if (localToken) {
            localStorage.setItem("user", JSON.stringify(updatedUser));
        } else if (sessionToken) {
            sessionStorage.setItem("user", JSON.stringify(updatedUser));
        }
    }

    // Try To Load User With Token When Mounted
    useEffect(() => {
        (async () => {
            try {
                const localUserRaw = localStorage.getItem("user");
                const sessionUserRaw = sessionStorage.getItem("user");
                const localToken = localStorage.getItem("token");
                const sessionToken = sessionStorage.getItem("token");

                const storedUser = localUserRaw ? JSON.parse(localUserRaw) : sessionUserRaw ? JSON.parse(sessionUserRaw) : null;
                const storedToken = localToken || sessionToken || null;
                const tokenFromLocal = !!localToken
                if (storedUser) {
                    setUser(storedUser);
                    setToken(storedToken);
                    setIsLoading(false);
                    return;
                }
                if (storedToken) {
                    try {
                        const res = await axios.get(`${DEFAULT_API_URL}/user/me`, {
                            headers: {Authorization: `Bearer ${storedToken}`},
                        })
                        const profile = res.data?.user
                        if (!profile) throw new Error("Resposta com perfil invalido")
                        persistAuth(profile, storedToken, tokenFromLocal);
                    } catch (fetchError) {
                        console.warn("Não foi possivel carregar o perfil com o token fornecido", fetchError);
                        clearAuth()
                    }
                }
            } catch (error) {
                console.error("Erro no Auth", error);
            } finally {
                setIsLoading(false);
            }
        })()
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem("transactions", JSON.stringify(transactions));
        } catch (error) {
            console.error("Erro salvando lançamentos", error);
        }
    }, [transactions])

    const handleLogin = (userData, remember = false, tokenFromApi = null) => {
        persistAuth(userData, tokenFromApi, remember);
        navigate("/");
    }

    const handleLogout = () => {
        clearAuth()
        navigate("/login");
    }

    const handleSignup = (userData, remember = false, tokenFromApi = null) => {
        persistAuth(userData, tokenFromApi, remember);
        navigate("/");
    }

    // Transaction Helpers
    const addTransaction = (newTransaction) => setTransactions((p) => [newTransaction, ...p])
    const editTransaction = (id, updatedTransaction) => setTransactions((p) => p.map((t) => t.id === id ? { ...t, ...updatedTransaction, id } : t))
    const deleteTransaction = (id) => setTransactions((p) => p.filter((t) => t.id !== id))
    const refreshTransactions = () => setTransactions(getTransactionsFromStorage())

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-gray-600">Carregando...</p>
                </div>
            </div>
        )
    }

    return (
      <>
          <ScrollTop />
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/signup" element={<Signup onSignup={handleSignup} />} />
            <Route element={
                // <ProtectedRoute user={user} >
                    <Layout
                        user={user}
                        onLogout={handleLogout}
                        transactions={transactions}
                        addTransaction={addTransaction}
                        editTransaction={editTransaction}
                        deleteTransaction={deleteTransaction}
                        refreshTransactions={refreshTransactions}
                    />
                // </ProtectedRoute>
            }>
                <Route
                    path="/" element={<Dashboard />}
                    transactions={transactions}
                    addTransaction={addTransaction}
                    editTransaction={editTransaction}
                    deleteTransaction={deleteTransaction}
                    refreshTransactions={refreshTransactions}
                />
            </Route>
           </Routes>
      </>
  )
}

export default App

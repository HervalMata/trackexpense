"use client"

import {Route, Routes, useNavigate} from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Layout from "./components/Layout.jsx";
import {useState} from "react";
import Login from "./components/Login.jsx";

const App = () => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
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

    const handleLogin = (userData, remember = false, tokenFromApi = null) => {
        persistAuth(userData, remember, tokenFromApi);
        navigate("/");
    }

    const handleLogout = () => {
        clearAuth()
        navigate("/login");
    }

    return (
      <>
        <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route element={<Layout user={user} onLogout={handleLogout} />}>
                <Route path="/" element={<Dashboard />} />
            </Route>
        </Routes>
      </>
  )
}

export default App

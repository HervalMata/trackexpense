"use client"

import {Route, Routes, useNavigate} from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Layout from "./components/Layout.jsx";
import {useState} from "react";

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

    const handleLogout = () => {
        clearAuth()
        navigate("/login");
    }

    return (
      <>
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
            </Route>
        </Routes>
      </>
  )
}

export default App

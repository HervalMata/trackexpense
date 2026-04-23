"use client"

import {navbarStyles} from "../assets/dummyStyles.js";
import img1 from "../assets/logo.png";
import {useNavigate} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import {ChevronDown, LogOut, User} from "lucide-react";
import axios from "axios";
import Add from "./Add.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Navbar = ({ user: propUser, onLogout}) => {
    const [menuOpen, setMenuOpen] = useState(false)
    const [fetchedUser, setFetchedUser] = useState(null)
    const navigate = useNavigate();
    const menuRef = useRef();

    const user = propUser || fetchedUser || {
        name: '',
        email: '',
    }

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;
                const response = await axios.get(`${API_BASE_URL}/user/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                const userData = response.data.user || response.data;
                setFetchedUser(userData);
            } catch (error) {
                console.error("Falha ao carregar dados do perfil", error);
            }
        }

        if (!propUser) {
            fetchUserData();
        }
    }, [propUser]);

    // Close The Toggle Menu If Click Outside The Box
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    const toggleMenu = () => setMenuOpen((prev) => !prev);

    const handlelogout = () => {
        setMenuOpen(false);
        if (typeof onLogout === "function") {
            onLogout();
        } else {
            localStorage.removeItem("token");
            navigate("/login");
        }
    }

    return (
        <header className={navbarStyles.header}>
            <div className={navbarStyles.container}>
                {/* Logo */}
                <div className={navbarStyles.logoContainer}>
                    <div className={navbarStyles.logoImage}>
                        <img src={img1} alt={"logo"}/>
                    </div>
                    <span className={navbarStyles.logoText}>
                        Gerenciador de Rendimentos
                    </span>

                </div>
                <Add />
                {/* If The User Is Present */}
                {user && (
                    <div className={navbarStyles.userContainer} ref={menuRef}>
                        <button className={navbarStyles.userButton} onClick={toggleMenu}>
                            <div className="relative">
                                <div className={navbarStyles.userAvatar}>
                                    {user?.name?.[0]?.toUpperCase() || "U"}
                                </div>
                                <div className={navbarStyles.statusIndicator}></div>
                            </div>
                            <div className={navbarStyles.userTextContainer}>
                                <p className={navbarStyles.userName}>
                                    {user?.name || "User"}
                                </p>
                                <p className={navbarStyles.userEmail}>
                                    {user?.email || "user@expensetracker.com"}
                                </p>
                            </div>
                            <ChevronDown className={navbarStyles.chevronIcon(menuOpen)} />
                        </button>
                        {/* Dropdown Menu */}
                        {menuOpen && (
                            <div className={navbarStyles.dropdownMenu}>
                                <div className={navbarStyles.dropdownHeader}>
                                    <div className="flex items-center gap-3">
                                        <div className={navbarStyles.dropdownAvatar}>
                                            {user?.name?.[0]?.toUpperCase() || "U"}
                                        </div>
                                        <div>
                                            <div className={navbarStyles.dropdownName}>
                                                {user?.name || "User"}
                                            </div>
                                            <div className={navbarStyles.dropdownEmail}>
                                                {user?.email || "user@expensetracker.com"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={navbarStyles.menuItemContainer}>
                                    <button
                                        className={navbarStyles.menuItem}
                                        onClick={() => {
                                            setMenuOpen(false);
                                            navigate("/profile");
                                        }}
                                    >
                                        <User className="h-4 w-4" />
                                        <span>Meu Perfil</span>
                                    </button>
                                </div>
                                <div className={navbarStyles.menuItemBorder}>
                                    <button
                                        className={navbarStyles.logoutButton}
                                        onClick={handlelogout}
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Sair</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    )
}

export default Navbar;

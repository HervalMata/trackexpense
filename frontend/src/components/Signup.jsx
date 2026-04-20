import {signupStyles} from "../assets/dummyStyles.js";
import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";
import {ArrowLeft, Eye, EyeOff, Lock, Mail, User} from "lucide-react";

const DEFAULT_API_URL = import.meta.env.VITE_API_BASE_URL

const Signup = ({ onSignup, API_URL = DEFAULT_API_URL }) => {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [errors, setErrors] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    // To Fetch Profile
    const fetchProfile = async (token) => {
        if (!token) return null
        const res = await axios.get(`${API_URL}/api/user/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        return res.data
    }

    const persistAuth = (profile, token) => {
        const storage = rememberMe ? localStorage : sessionStorage
        try {
            if (token) storage.setItem("token", token)
            if (profile) storage.setItem("user", JSON.stringify(profile))
        } catch (error) {
            console.error("Falha no storage", error)
        }
    }

    // To Validate That All Fields Are Filled By User Or Not
    const validateForm = () => {
        const newErrors = {}
        if (!name.trim()) {
            newErrors.name = "Nome é requerido"
        }
        if (!email.trim()) {
            newErrors.email = "Email é requerido"
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Email é invalido"
        }
        if (!password.trim()) {
            newErrors.password = "Senha é requerida"
        } else if (password.length < 6) {
            newErrors.password = "Senha deve ter pelo menos 6 caracteres"
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrors("")
        if (!validateForm()) return
        setIsLoading(true)

        try {
            const res = await axios.post(`${API_URL}/api/user/register`, {name, email, password}, {
                headers: { "Content-Type": "application/json" },
            })
            const data = res.data || {}
            const token = data.token || null
            // To Derive Your Profile
            let profile = data.user ?? null
            if (!profile) {
                const copy = { ...data }
                delete copy.token
                delete data.user
                if (Object.keys(copy).length) {
                    profile = copy
                }
            }
            if (!profile && token) {
                try {
                    profile = await fetchProfile(token)
                } catch (fetchError) {
                    console.warn("Não foi possivel carregar os dados do perfil após login", fetchError)
                    profile = null
                }
            }
            if (!profile) profile = { name, email }
            persistAuth(profile, token)
            if (typeof onSignup === "function") {
                try {
                    onSignup(profile, rememberMe, token)
                } catch (callError) {
                    console.warn("Erro ao registrar", callError)
                    navigate("/")
                }
            } else {
                navigate("/")
            }
            setPassword("")
        } catch (error) {
            console.error("Falha no registro", error?.response || error)
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors)
            } else if (error.response?.data?.message) {
                setErrors({ api: error.response.data.message })
            } else {
                setErrors({ api: error.message || "Um erro inexperado ocorreu" })
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={signupStyles.pageContainer}>
            <div className={signupStyles.cardContainer}>
                <div className={signupStyles.header}>
                    <button
                        onClick={() => navigate(-1)}
                        className={signupStyles.backButton}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className={signupStyles.avatar}>
                        <User className="w-10 h-10 text-white" />
                    </div>
                    <h1 className={signupStyles.headerTitle}>
                        Crie sua conta
                    </h1>
                    <p className={signupStyles.headerSubtitle}>
                        Se junte a nós para gerenciar suas finanças
                    </p>
                </div>
                <div className={signupStyles.formContainer}>
                    {errors.api && <p className={signupStyles.apiError} role="alert" aria-live="assertive">{errors.api}</p> }
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="mb-6">
                            <label htmlFor="name" className={signupStyles.label}>
                                Nome
                            </label>
                            <div className={signupStyles.inputContainer}>
                                <div className={signupStyles.inputIcon}>
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    autoComplete="name"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={`${signupStyles.input} ${
                                        errors.name ? "border-red-300" : "border-gray-200"
                                    }`}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            {errors.name && (
                                <p className={signupStyles.fieldError}>{errors.name}</p>
                            )}
                        </div>
                        <div className="mb-6">
                            <label htmlFor="email" className={signupStyles.label}>
                                Email
                            </label>
                            <div className={signupStyles.inputContainer}>
                                <div className={signupStyles.inputIcon}>
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`${signupStyles.input} ${
                                        errors.email ? "border-red-300" : "border-gray-200"
                                    }`}
                                    placeholder="seuemail@exemplo.com"
                                    required
                                />
                            </div>
                            {errors.email && (
                                <p className={signupStyles.fieldError}>{errors.email}</p>
                            )}
                        </div>
                        <div className="mb-6">
                            <label htmlFor="password" className={signupStyles.label}>
                                Senha
                            </label>
                            <div className={signupStyles.inputContainer}>
                                <div className={signupStyles.inputIcon}>
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`${signupStyles.input} ${
                                        errors.password ? "border-red-300" : "border-gray-200"
                                    }`}
                                    placeholder="******"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={signupStyles.passwordToggle}
                                    aria-label={showPassword ? "Ocultar Senha" : "Mostrar Senha"}
                                    title={showPassword ? "Ocultar Senha" : "Mostrar Senha"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className={signupStyles.fieldError}>{errors.password}</p>
                            )}
                        </div>
                        <div className={signupStyles.checkboxContainer}>
                            <input
                                type="checkbox"
                                id="remember"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className={signupStyles.checkbox}
                            />
                            <label htmlFor="remember" className={signupStyles.checkboxLabel}>
                                Lembrar-me
                            </label>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`${signupStyles.button} ${isLoading ? signupStyles.buttonDisabled : ""}`}
                        >
                            {isLoading ? (
                                <>
                                    <svg
                                        className={signupStyles.spinner}
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Criando conta...
                                </>
                            ) : (
                                "Cadastre-se"
                            )}
                        </button>
                    </form>
                    <div className={signupStyles.signInContainer}>
                        <p className={signupStyles.signInText}>
                            Já tem uma conta?{" "}
                            <Link to="/login" className={signupStyles.signInLink}>
                                Entre com sua conta
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Signup

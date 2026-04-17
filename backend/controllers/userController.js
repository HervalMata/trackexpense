import User from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRES = process.env.TOKEN_EXPIRES;

const createToken = (userId) => jwt.sign({id: userId}, process.env.JWT_SECRET, {expiresIn: TOKEN_EXPIRES});

// REGISTER A USER
export async function registerUser(req, res) {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Todos os campos são requeridos',
        })
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Email invalido!"
        })
    }
    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "A senha deve ter pelo menos 8 caracteres!"
        })
    }
    try {
        if (await User.findOne({ email: email })) {
            return res.status(409).json({
                success: false,
                message: "Usuário jã existe!"
            })
        }
        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({name, email, password: hashed})
        const token = createToken(user._id)
        res.status(201).json({
            success: true,
            token: token,
            user: { id: user._id, name: user.name, email: user.email },
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Erro no servidor!",
        })
    }
}

// LOGIN USER
export async function loginUser(req, res) {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Todos os campos são requeridos!"
        })
    }
    try {
        const user = await User.findOne({ email: email })
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Email e/ou senha invalidos!"
            })
        }
        const match = await bcrypt.compare(password, user.password)
        if (!match) {
            return res.status(401).json({
                success: false,
                message: "Email e/ou senha invalidos!"
            })
        }
        const token = createToken(user._id)
        res.json({
            success: true,
            token: token,
            user: { id: user._id, name: user.name, email: user.email },
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Erro no servidor!",
        })
    }
}

// GET USER LOGGED IN
export async function getCurrentUser(req, res) {
    try {
        const user = await User.findById(req.user.id).select("name email")
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuário não encontrado!"
            })
        }
        res.json({
            success: true,
            user,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Erro no servidor!",
        })
    }
}

// UPDATE USER PROFILE
export async function updateUserProfile(req, res) {
    const { name, email } = req.body
    if (!name || !email || !validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Um email valido e nome são requeridos!"
        })
    }
    try {
        const exists = await User.findOne({ email: email, _id: { $ne: req.user.id } })
        if (exists) {
            return res.status(409).json({
                success: false,
                message: "Email já em uso!"
            })
        }
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, email },
            { new: true, runValidators: true },
        ).select("name email")
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuário não encontrado!"
            })
        }
        return res.json({
            success: true,
            user,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Erro no servidor!",
        })
    }
}

// CHANGE USER PASSWORD
export async function updatePassword(req, res) {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword || newPassword.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Senha invalida ou muito curta."
        })
    }
    try {
        const user = await User.findById(req.user.id).select("password")
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuário não encontrado!"
            })
        }
        const match = await bcrypt.compare(currentPassword, user.password)
        if (!match) {
            return res.status(401).json({
                success: false,
                message: "A Senha está incorreta."
            })
        }
        user.password = await bcrypt.hash(newPassword, 10)
        await user.save()
        return res.json({
            success: true,
            message: "Senha alterada com sucesso!"
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Erro no servidor!",
        })
    }
}

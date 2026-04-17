import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export default async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Não autorizado ou token perdido",
        })
    }
    const token = authHeader.split(" ")[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const user = User.findById(payload.id).select("-password")
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Usuário não encontrado",
            })
        }
        req.user = user
        return next()
    } catch (error) {
        console.error("Falha na verificação JWT: ", error)
        return res.status(401).json({
            success: false,
            message: "Token invalido ou expirado!"
        })
    }
}

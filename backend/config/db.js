import mongoose from 'mongoose'

export const connectDB = async () => {
    await mongoose.connect("mongodb+srv://camasilva84_db_user:1J5WEu8TmNuiKYWH@cluster0.ijzrmrs.mongodb.net/")
        .then(() => console.log('Connected to MongoDB'))
}

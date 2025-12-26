import mongoose from "mongoose";
import { hashPassword } from "./utils/auth.js";
import User from "./src/models/UserModel.js";

await mongoose.connect(process.env.MONGODB_URL);

const hashedPassword = await hashPassword("Test@123456789");

await User.create({
    user_id: "ADMIN001",
    full_name: "Dermatech Admin",
    phone: "918790657624",
    email: "admin@gmail.com",
    role: "Admin",
    password: hashedPassword
});

process.exit();

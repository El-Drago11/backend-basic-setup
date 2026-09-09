import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { fileURLToPath } from "url";
import path from "path";
import { dbconnection } from "./config/dbConnection.js";
import adminAuthRouter from "./src/routes/admin/AdminAuthRoute.js";
import cookieParser from "cookie-parser";
import { local_admin, local_frontend } from "./utils/envImporter.js";

dotenv.config()
const app = express()

app.use(cookieParser());
app.use(cors({
  origin: [local_frontend,local_admin],
  credentials: true,
}));
app.use(express.json())
app.use(helmet());
dbconnection()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))
app.use("", express.static(path.join(__dirname, "")));

//routers
app.use('/api/v1/admin/auth',adminAuthRouter)

app.get("/", (_, resp) => {
    return resp.status(200).json({ message: "Application running sucessfully!" })
})


const port = process.env.BACKEND_PORT || 3400;
app.listen(port, () => {
    console.log(`Application is running in port : ${port}`)
})


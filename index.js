import express, { response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import path from "path";
import dbConnection from "./config/dbConnection.js";


const app = express()
dotenv.config()
app.use(cors())
app.use(express.json())
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());
dbConnection()

const blockedIPs = new Map();

app.use((req, res, next) => {
    const ip = req.ip;

    if (blockedIPs.has(ip)) {
        const unblockTime = blockedIPs.get(ip);

        if (Date.now() < unblockTime) {
            return handleResponse(429, "Too many requests. You are blocked for 4 minutes.", {}, res);
        } else {
            blockedIPs.delete(ip);
        }
    }

    next();
});

const limit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    handler: (req, res) => {
        const ip = req.ip;
        const blockDuration = 4 * 60 * 1000;

        blockedIPs.set(ip, Date.now() + blockDuration);

        return handleResponse(429, "Rate limit exceeded. You are temporarily blocked for 4 minutes.", {}, res);
    }
});

app.use(limit);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))


app.use("", express.static(path.join(__dirname, "")));

app.get("/", (req, resp) => {
    return resp.status(200).json({ message: "Application running sucessfully!" })
})


const port = process.env.PORT || 3400;
app.listen(port, () => {
    console.log(`Application is running in port : ${port}`)
})


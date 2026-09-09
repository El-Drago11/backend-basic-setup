import dotenv from "dotenv";

dotenv.config(); 
const env_process = process.env

// Email Env Variables
export const email_host = env_process.EMAIL_HOST;
export const email_port = env_process.EMAIL_PORT;
export const email_user = env_process.EMAIL_USER;
export const email_pass = env_process.EMAIL_PASS;
export const email_from = env_process.EMAIL_FROM;

// Frontend urls
export const local_frontend = env_process.FRONT_URL_LOCAL;
export const local_admin = env_process.ADMIN_URL_LOCAL;

// JWT
export const JWT_SECRET = env_process.JWT_SECRET_KEY;
export const JWT_EXPIRY = env_process.JWT_EXPIRY;
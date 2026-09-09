
import User from "../src/models/UserModel.js";
import { verifyToken } from "../utils/auth.js";
import { JWT_SECRET } from "../utils/envImporter.js";
import handleResponse from "../utils/http-response.js";

export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req?.headers['authorization'];
        const token = authHeader ? authHeader.split(' ')[1] : (req?.cookies?.token) ;

        if (!token) {
            return handleResponse(401, 'No token provided', {}, res);
        }

        const decoded = verifyToken(token, JWT_SECRET)

        const user = await User.findById(decoded._id)

        if (!user) {
            return handleResponse(404, 'User not found', {}, res);
        }

        if (user.role == "User") {
            return handleResponse(401, "Not allowed to access this", {}, res)
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("error : ", error)
        if (error.name === 'TokenExpiredError') {
            return handleResponse(401, 'Token has expired', {}, res);
        }
        return handleResponse(401, 'Invalid token', {}, res);
    }
};


export const userAuthenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader ? authHeader.split(' ')[1] : (req?.cookies?.token) ;

        if (!token) {
            return handleResponse(401, 'No token provided', {}, res);
        }

        const decoded = verifyToken(token, JWT_SECRET)

        const user = await User.findById(decoded._id)

        if (!user) {
            return handleResponse(404, 'User not found', {}, res);
        }

        if (user.role != "User") {
            return handleResponse(401, "Not allowed to access this", {}, res)
        }

        if (user.status != "ACTIVE") {
            return handleResponse(401, "User is not active", {}, res)
        }

        if (user.email_verified == false) {
            return handleResponse(401, "Email is not verified", {}, res)
        }

        if (user.phone_verified == false) {
            return handleResponse(401, "Phone is not verified", {}, res)
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("error : ", error)
        if (error.name === 'TokenExpiredError') {
            return handleResponse(401, 'Token has expired', {}, res);
        }
        return handleResponse(401, 'Invalid token', {}, res);
    }
};


export const authenticateOtpToken = async (req, res, next) => {
    try {
        const token = (req?.cookies?.otp_token) ;

        if (!token) {
            return handleResponse(401, 'No token provided', {}, res);
        }

        const decoded = verifyToken(token, JWT_SECRET)

        const user = await User.findById(decoded._id)

        if (!user) {
            return handleResponse(404, 'User not found', {}, res);
        }

        if (user.role == "User") {
            return handleResponse(401, "Not allowed to access this", {}, res)
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("error : ", error)
        if (error.name === 'TokenExpiredError') {
            return handleResponse(401, 'Token has expired', {}, res);
        }
        return handleResponse(401, 'Invalid token', {}, res);
    }
};
import mongoose from "mongoose";
import { comparePassword, generateOTP, generateToken, hashPassword } from "../../../utils/auth.js";
import handleResponse from "../../../utils/http-response.js";
import User from "../../models/UserModel.js";
import { sendEmail } from "../../../config/emailConfig.js";
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from "../../../config/jwtConfig.js";

//Login User
export const adminlogin = async (req, resp) => {
    try {

        const { email, password } = req.body;
        const userDetail = await User.findOne({ email });

        if (!userDetail)
            return handleResponse(404, "User not found", {}, resp);
        if (userDetail.role == "User") return handleResponse(401, "Not Authorise to access it.", {}, resp)

        if (userDetail.role != "Admin") {
            return handleResponse(401, "Not Authorise to access it.", {}, resp)
        }

        const isPasswordValid = await comparePassword(
            password,
            userDetail.password
        );

        if (!isPasswordValid)
            return handleResponse(400, "Invalid credentials", {}, resp);

        const token = generateToken({
            _id: userDetail._id,
            email: userDetail.email,
            role: userDetail.role
        });

        const data = {
            token,
            userDetail: userDetail.toObject()
        };

        delete data.userDetail.password;
        delete data.userDetail.otp;

        return handleResponse(200, "Login Successful", data, resp);

    } catch (err) {
        return handleResponse(500, err?.message, {}, resp);
    }
};

//Edit Profile Data
export const adminEditProfile = async (req, resp) => {

    const session = await mongoose.startSession();

    try {
        const { id } = req.params;
        const body = req.body;
        const files = req.files.profile_pic?.[0];

        await session.withTransaction(async () => {

            const existingUser = await User.findById(id).session(session);
            if (!existingUser) {
                throw new Error("User not found");
            }

            const payload = {
                ...body,
            };

            if (body?.profile_pic && !files?.profile_pic) {
                payload.profile_pic = normalizePath(body.profile_pic);
            } else {
                payload.profile_pic = files?.filename
            }

            Object.keys(payload).forEach(
                key => payload[key] === undefined && delete payload[key]
            );

            const updatedUser = await User.findByIdAndUpdate(
                id,
                { $set: payload },
                { new: true, session }
            );

            if (!updatedUser) {
                throw new Error("User update failed");
            }

            return handleResponse(
                200,
                "Profile updated successfully",
                updatedUser,
                resp
            );
        });

    } catch (err) {
        return handleResponse(400, err.message, {}, resp);
    } finally {
        session.endSession();
    }
};

//Get Profile Details
export const getAdminProfile = async (req, resp) => {
    try {
        const user = req.user;

        const userDetail = await User.findById(user?._id).select("-password -createdAt -createdBy -updatedBy -__v")

        if (!userDetail) return handleResponse(404, "User not found", {}, resp)

        return handleResponse(200, "Profile fetched successfully", { ...userDetail?.toObject() }, resp)

    } catch (err) {
        return handleResponse(500, err?.message, {}, resp)
    }
}

//send verification otp
export const sendVerifyOTP = async (req, resp) => {
    try {
        const { phone, email, type, id } = req.body;

        if (!type || !id) {
            return handleResponse(400, "ID and Type are required", {}, resp);
        }

        let record = await User.findById(id);
        let modelType = "User";

        if (!record) {
            return handleResponse(404, "User not found", {}, resp);
        }

        const otp = generateOTP();

        if (type === "phone") {
            if (!phone) return handleResponse(400, "Phone is required", {}, resp);
            record.phone = phone;
        } else if (type === "email") {
            if (!email) return handleResponse(400, "Email is required", {}, resp);
            record.email = email;
        } else {
            return handleResponse(400, "Invalid type. Only 'phone' or 'email' allowed.", {}, resp);
        }

        record.otp = otp;
        await record.save();

        if (type === "phone") {
            console.log(`SMS to ${phone}: Your OTP is ${otp}`);
        } else {
            await sendEmail({
                to: email,
                subject: "Verification Code",
                html: `
                    <p>Your verification OTP is:</p>
                    <h2><b>${otp}</b></h2>
                    <p>Model: ${modelType}</p>
                    `
            })
        }

        return handleResponse(200, `Verification Code sent successfully to ${modelType}`, {}, resp);

    } catch (err) {
        return handleResponse(500, err?.message || "Server Error", {}, resp);
    }
};

// change pasword
export const changePasword = async (req, resp) => {
    try {
        const user = req.user;
        const { newPassword, oldPassword } = req.body;

        if (
            typeof newPassword !== "string" || typeof oldPassword !== "string" ||
            !newPassword.trim() || !oldPassword.trim()
        ) {
            return handleResponse(
                400,
                "New password and old password are required",
                {},
                resp
            );
        }

        const userDetail = await User.findById(user?._id)
        if (!userDetail) return handleResponse(404, "User not found", {}, resp)

        const isPasswordValid = await comparePassword(oldPassword, userDetail.password)

        if (!isPasswordValid) return handleResponse(400, "Incorrect current password", {}, resp)

        const hashedPassword = await hashPassword(newPassword)

        userDetail.password = hashedPassword
        await userDetail.save()

        return handleResponse(200, "Password changed Successfully", {}, resp)

    } catch (err) {
        return handleResponse(500, err?.message || "Server Error", {}, resp);
    }
}

//forgot passsword (get email and send code)
export const forgotPasword = async (req, resp) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email })

        if (!user) return handleResponse(404, "User not found", {}, resp);

        const OTP = generateOTP()

        user.otp = OTP;
        await user.save()

        await sendEmail(
            {
                to: email,
                subject: "Clinic Dermatech - Verification Code",
                html: `verification otp:${OTP}`
            }
        )

        return handleResponse(200, "OTP sent Successfully", {}, resp)

    } catch (err) {
        console.log("forgot password error : ", err)
        return handleResponse(500, err?.message, {}, resp)
    }
}

// verify otp
export const verifyCode = async (req, resp) => {
    try {

        const { email, otp } = req.body;
        if (email == null || email == undefined) return handleResponse(400, "Email is required!", {}, resp);
        if (otp == null || otp == undefined) return handleResponse(400, "OTP is required!", {}, resp);

        const user = await User.findOne({ email })
        if (!user) return handleResponse(404, "User not found", {}, resp);

        if (user.otp != otp) return handleResponse(400, "Invalid OTP", {}, resp)

        user.otp = null;
        await user.save()

        const token = jwt.sign({
            _id: user._id,
            email: user.email,
            role: user.role,
        },
            JWT_SECRET,
            { expiresIn: '5m' }
        );

        const options = {
            expires: new Date(Date.now() + 5 * 60 * 1000),
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        };

        return resp.cookie("otp_token", token, options).status(200).json({
            success: true,
            data: {},
            message: 'OTP Verifed Successfully!'
        })

    } catch (err) {
        return handleResponse(500, err?.message, {}, resp)
    }
}

// reset pasword
export const resetPassword = async (req, resp) => {
    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email })

        if (!user) return handleResponse(404, "User not found", {}, resp);

        const hashedPassword = await hashPassword(password)
        user.password = hashedPassword;
        await user.save()

        resp.clearCookie("otp_token", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
        });

        return handleResponse(200, "Password reset Successfully", {}, resp)
    } catch (err) {
        return handleResponse(500, err?.message, {}, resp)
    }
}


//verify email and phone number
export const verifyEmailPhone = async (req, resp) => {
    try {
        const { email, phone, type, otp, id } = req.body;

        if (!type || !otp || !id) {
            return handleResponse(400, "ID, Type and OTP are required", {}, resp);
        }

        let record = await User.findById(id);
        let modelType = "User";

        if (!record) {
            record = await Store.findById(id);
            modelType = "Store";
        }

        if (!record) {
            return handleResponse(404, "User/Store not found", {}, resp);
        }

        if (String(record.otp) !== String(otp)) {
            return handleResponse(400, "Invalid OTP", {}, resp);
        }

        if (type === "phone") {
            if (!phone) return handleResponse(400, "Phone is required", {}, resp);
            record.phone_verified = true;
        } else if (type === "email") {
            if (!email) return handleResponse(400, "Email is required", {}, resp);
            record.email_verified = true;
        } else {
            return handleResponse(400, "Invalid type. Allowed types: email, phone", {}, resp);
        }

        record.otp = null;

        let generatedPassword = null;

        if (type === "email") {
            generatedPassword = generatedPassword(10);
            const hashedPassword = await hashPassword(generatedPassword);
            record.password = hashedPassword;
        }

        await record.save();

        if (type === "email") {
            await sendEmail({
                to: email,
                subject: "Login Credentials",
                html: `
                    <p><strong>Login Credentials (${modelType})</strong></p>
                    <p>Email: ${email}</p>
                    <p>Password: <strong>${generatedPassword}</strong></p>
                    `
            });
        }

        return handleResponse(200, `${type === "phone" ? "Phone Number" : "Email"} Verified Successfully`, { verifiedFor: modelType }, resp);

    } catch (err) {
        return handleResponse(500, err?.message || "Server Error", {}, resp);
    }
};
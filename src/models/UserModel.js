import mongoose from "mongoose";

const UserModel = mongoose.Schema(
    {
        user_id: {
            type: String,
            required: true
        },
        full_name: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            validate: {
                validator: function (val) {
                    return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(val);
                },
                message: "Invalid email format"
            }
        },
        role: {
            type: String,
            enum: ["Admin", "User"]
        },
        profile_pic: {
            type: String,
            get: (val) => {
                if (!val) return;

                if (val?.startsWith("http")) {
                    return val
                }

                return `${process.env.IMAGE_URL}/${val}`
            }
        },
        password: {
            type: String,
            required: true
        },
        otp: {
            type: Number,
        },
    },
    {
        timestamps: true,
        retainNullValues: true,
        toJSON: { getters: true },
        toObject: { getters: true },
    }
)


const User = mongoose.model("User", UserModel)

export default User;



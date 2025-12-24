import mongoose from "mongoose";

const HomePageSchema = new mongoose.Schema(
    {
        banner_image: {
            type: String,
            required: true,
            trim: true,
            get: (val) => {
                if (!val) return val;

                if (val.startsWith("http")) return val;

                return `${process.env.IMAGE_URL}${val}`;
            },
        },
        banner_name: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
        toJSON: { getters: true },
        toObject: { getters: true },
    }
);


export default mongoose.model("homePage", HomePageSchema);
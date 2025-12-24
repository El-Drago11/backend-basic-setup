import fileUpload from "../config/MulterConfig.js";

const homePageImageUpload = fileUpload("public/home")
const HomeImagesUpload = homePageImageUpload.fields([
    { name: "banner_image", maxCount: 1 }
])

export { HomeImagesUpload }
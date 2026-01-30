import fileUpload from "../config/MulterConfig.js";

const homePageImageUpload = fileUpload("public/home")
const HomeImagesUpload = homePageImageUpload.fields([
    { name: "banner_image", maxCount: 1 }
])

const userUpload = fileUpload("public/user")
const userImagesUpload = userUpload.fields([
    { name: "profile_pic", maxCount: 1 }
])


export { HomeImagesUpload, userImagesUpload}
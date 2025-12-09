import fileUpload from "../config/MulterConfig.js";


const userUpload = fileUpload("public/user")
const userImagesUpload = userUpload.fields([
    { name: "dock_front_side", maxCount: 1 },
    { name: "dock_back_side", maxCount: 1 },
    { name: "profile_pic", maxCount: 1 }
])


const brandUpload = fileUpload("public/brand")
const brandImagesUpload = brandUpload.fields([
    { name: "logo", maxCount: 1 }
])


const productUpload = fileUpload("public/product")
const productImagesUpload = productUpload.any()

const proofUpload = fileUpload("public/payment")
const paymentReceiptUpload = proofUpload.fields([
    { name: "proof", maxCount: 1 }
])



export {
    userImagesUpload,
    brandImagesUpload,
    productImagesUpload,
    paymentReceiptUpload
}
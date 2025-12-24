import mongoose from "mongoose";

export const dbconnection = ()=>{
    mongoose.connect(process.env.MONGODB_URL,{
        // useNewUrlParser:true,
        // useUnifiedTopology:true
    }).then(()=>console.log('Db is connected successfully'))
    .catch((error)=>{
        console.log(error);
        process.exit(1);
    });
}
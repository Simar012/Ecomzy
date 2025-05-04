const mongoose = require('mongoose');
mongoose.set('strictQuery', false); 
const MONGO_URI = process.env.MONGO_URI;

const connectDatabase = () => {
    mongoose.connect(MONGO_URI)
        .then(() => {
            console.log("Mongoose Connected");
        }).catch((err)=>{
            console.log("FAILED",err.message)
        })
}
module.exports = connectDatabase;

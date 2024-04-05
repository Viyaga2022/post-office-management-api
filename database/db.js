const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Db Connected");
    } catch (error) {
        console.log(`Db connection failed, ${error}`);
    }
}

module.exports = { connectDB };
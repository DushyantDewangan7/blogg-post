const mongoose = require('mongoose');

const connectToMongo = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/blogg")
        console.log('Connected to MongoDB')
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message)
    }
}
module.exports = connectToMongo
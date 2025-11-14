import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/idea-octopus'
    const conn = await mongoose.connect(mongoURI.trim())

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`)
    console.error('💡 Tip: Make sure your IP is whitelisted in MongoDB Atlas')
    // Don't exit - let server continue without DB for now
    // process.exit(1)
  }
}

export default connectDB


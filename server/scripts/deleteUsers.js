import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js'
import Team from '../models/Team.js'

// Load environment variables
dotenv.config()

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not set in .env file')
  process.exit(1)
}

async function deleteAllUsers() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(MONGO_URI)
    console.log('✅ Connected to MongoDB')

    // Get count before deletion
    const userCount = await User.countDocuments()
    console.log(`📊 Found ${userCount} user(s) in database`)

    if (userCount === 0) {
      console.log('ℹ️  No users to delete')
      await mongoose.connection.close()
      process.exit(0)
    }

    // Delete all users
    console.log('🗑️  Deleting all users...')
    const result = await User.deleteMany({})
    console.log(`✅ Deleted ${result.deletedCount} user(s)`)

    // Optionally delete teams that were created during signup
    // (Teams that have no members or were auto-created)
    console.log('🔍 Checking for orphaned teams...')
    const teamCount = await Team.countDocuments()
    console.log(`📊 Found ${teamCount} team(s) in database`)

    // Ask if user wants to delete teams too
    // For now, we'll just delete teams that have no members
    const orphanedTeams = await Team.find({ 
      $or: [
        { members: { $size: 0 } },
        { members: { $exists: false } }
      ]
    })
    
    if (orphanedTeams.length > 0) {
      console.log(`🗑️  Deleting ${orphanedTeams.length} orphaned team(s)...`)
      const teamResult = await Team.deleteMany({ 
        $or: [
          { members: { $size: 0 } },
          { members: { $exists: false } }
        ]
      })
      console.log(`✅ Deleted ${teamResult.deletedCount} orphaned team(s)`)
    }

    console.log('✅ All user data deleted successfully')
    
    // Close connection
    await mongoose.connection.close()
    console.log('🔌 MongoDB connection closed')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error deleting users:', error)
    await mongoose.connection.close()
    process.exit(1)
  }
}

// Run the script
deleteAllUsers()


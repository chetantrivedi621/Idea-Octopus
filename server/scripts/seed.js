import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Team from '../models/Team.js'
import Round from '../models/Round.js'

dotenv.config()

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/idea-octopus', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('MongoDB Connected')
    
    // Clear existing data
    await Team.deleteMany({})
    await Round.deleteMany({})
    
    // Seed Teams
    const teams = [
      { name: 'Team Innovators', description: 'AI Study Assistant', category: 'EdTech' },
      { name: 'Code Wizards', description: 'Green Energy Tracker', category: 'Sustainability' },
      { name: 'Team Code Black', description: 'Midnight Snack Finder', category: 'Funny Ideas' },
      { name: 'Byte Squad', description: 'Virtual Pet Therapist', category: 'HealthTech' },
      { name: 'Hack Titans', description: 'Dream Analyzer', category: 'AI' }
    ]
    
    const createdTeams = await Team.insertMany(teams)
    console.log('✅ Teams seeded:', createdTeams.length)
    
    // Seed Rounds
    const rounds = [
      { name: 'Registration', status: 'upcoming', order: 1 },
      { name: 'Round 1: Ideation', status: 'upcoming', order: 2 },
      { name: 'Round 2: Development', status: 'upcoming', order: 3 },
      { name: 'Round 3: Presentation', status: 'upcoming', order: 4 },
      { name: 'Results & Awards', status: 'upcoming', order: 5 }
    ]
    
    const createdRounds = await Round.insertMany(rounds)
    console.log('✅ Rounds seeded:', createdRounds.length)
    
    console.log('✅ Database seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()


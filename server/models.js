import mongoose from 'mongoose'


const DeckSchema = new mongoose.Schema({
filename: { type: String, required: true },
mime: { type: String, required: true },
size: { type: Number, required: true },
storage: {
kind: { type: String, enum: ['gridfs'], default: 'gridfs' },
fileId: { type: mongoose.Schema.Types.ObjectId, required: true }
},
teamName: { type: String, default: null, index: true } // Optional team name for easier lookup
}, { timestamps: true })


const JobSchema = new mongoose.Schema({
deckId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deck', required: true },
status: { type: String, enum: ['queued', 'processing', 'done', 'error'], default: 'queued' },
progress: { type: Number, default: 0 },
error: { type: String, default: null }
}, { timestamps: true })


const SummarySchema = new mongoose.Schema({
deckId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deck', index: true, unique: true },
meta: { slides: Number, language: String, readabilityGrade: Number },
tldr: [String],
nonTechnicalBrief: String,
glossary: [{ term: String, simple: String }],
highlights: {
problem: String,
solution: String,
howSimple: String,
evidenceMetrics: [String],
differentiation: [String],
risks: [String]
},
evaluatorQuestions: [String],
flags: {
boldClaimsWithoutSource: [String],
missingPieces: [String],
inconsistencies: [String]
},
rubricScores: {
problemClarity: Number,
solutionFeasibility: Number,
impactPotential: Number,
evidenceQuality: Number,
communicationClarity: Number
}
}, { timestamps: true })


export const Decks = mongoose.model('Deck', DeckSchema)
export const Jobs = mongoose.model('Job', JobSchema)
export const Summaries = mongoose.model('Summary', SummarySchema)
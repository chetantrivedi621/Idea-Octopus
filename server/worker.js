// worker.js (ESM)
import 'dotenv/config'
import mongoose from 'mongoose'
import { Decks, Jobs, Summaries } from './models.js'
import { extractSlides } from './utils/extractClient.js'
import { buildPrompt } from './utils/prompt.js'
import { summarizeWithLLM } from './utils/llmClient.js'

await mongoose.connect(process.env.MONGO_URI)
console.log('✅ Worker connected to MongoDB')

const bucket = () =>
  new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'decks' })

async function fileBufferFromGridFS(fileId) {
  const chunks = []
  await new Promise((resolve, reject) => {
    bucket()
      .openDownloadStream(fileId)
      .on('data', c => chunks.push(c))
      .on('end', resolve)
      .on('error', reject)
  })
  return Buffer.concat(chunks)
}

function calcReadabilityRough(text) {
  const words = (text || '').split(/\s+/).filter(Boolean).length || 1
  return Math.max(7, Math.min(10, 6 + words / 120))
}

async function processOne() {
  const job = await Jobs.findOneAndUpdate(
    { status: 'queued' },
    { $set: { status: 'processing', updatedAt: new Date() } },
    { sort: { createdAt: 1 }, new: true }
  )
  if (!job) return false

  console.log('🔄 Processing job:', { jobId: job._id, deckId: job.deckId })

  try {
    const deck = await Decks.findById(job.deckId)
    if (!deck) throw new Error('Deck not found')
    
    console.log('📄 Deck found:', { 
      deckId: deck._id, 
      filename: deck.filename, 
      teamName: deck.teamName,
      fileId: deck.storage.fileId 
    })

    console.log('📥 Downloading file from GridFS...')
    const buffer = await fileBufferFromGridFS(deck.storage.fileId)
    console.log('✅ File downloaded from GridFS, size:', buffer.length, 'bytes')

    console.log('🔍 Extracting slides...')
    const extraction = await extractSlides({
      filename: deck.filename,
      buffer,
      extractorUrl: process.env.EXTRACTOR_URL
    })
    const slides = extraction.slides || []
    console.log('✅ Extracted', slides.length, 'slides')

    console.log('🤖 Generating AI summary...')
    const prompt = buildPrompt(slides)
    const out = await summarizeWithLLM(prompt)
    console.log('✅ AI summary generated')

    const textForReadability = [...(out.tldr || []), out.nonTechnicalBrief || ''].join(' ')
    const readabilityGrade = out.meta?.readabilityGrade || calcReadabilityRough(textForReadability)

    console.log('💾 Saving summary to database...')
    await Summaries.create({
      deckId: deck._id,
      meta: { slides: slides.length, language: 'en', readabilityGrade },
      tldr: out.tldr || [],
      nonTechnicalBrief: out.nonTechnicalBrief || '',
      glossary: out.glossary || [],
      highlights: out.highlights || {},
      evaluatorQuestions: out.evaluatorQuestions || [],
      flags: out.flags || { boldClaimsWithoutSource: [], missingPieces: [], inconsistencies: [] },
      rubricScores: out.rubricScores || {
        problemClarity: 0,
        solutionFeasibility: 0,
        impactPotential: 0,
        evidenceQuality: 0,
        communicationClarity: 0
      }
    })
    console.log('✅ Summary saved to database')

    await Jobs.findByIdAndUpdate(job._id, {
      $set: { status: 'done', progress: 100, updatedAt: new Date() }
    })
    console.log('🎉 Job completed successfully!')
  } catch (err) {
    console.error('❌ Worker error:', err)
    await Jobs.findByIdAndUpdate(job._id, {
      $set: { status: 'error', error: String(err), updatedAt: new Date() }
    })
  }
  return true
}

;(async function loop() {
  console.log('🌀 Worker started — waiting for jobs...')
  console.log('📋 Worker configuration:')
  console.log('   - EXTRACTOR_URL:', process.env.EXTRACTOR_URL || 'not set')
  console.log('   - LLM_PROVIDER:', process.env.LLM_PROVIDER || 'not set')
  console.log('   - MONGO_URI:', process.env.MONGO_URI ? 'set' : 'not set')
  
  while (true) {
    const worked = await processOne()
    if (!worked) {
      // No jobs available, wait before checking again
      await new Promise(r => setTimeout(r, 2000))
    }
  }
})()

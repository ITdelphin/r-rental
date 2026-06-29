const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

const sql = fs.readFileSync(path.join(__dirname, 'supabase', 'migrations', '00001_schema.sql'), 'utf8')

async function run() {
  const client = new Client({
    host: 'aws-0-us-east-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.gptlrwjefqyovtucvibs',
    password: 'Rental123@2026',
    ssl: { rejectUnauthorized: false },
  })
  await client.connect()
  console.log('Connected. Running migration...')
  await client.query(sql)
  console.log('Migration 00001 completed.')
  
  const seedSql = fs.readFileSync(path.join(__dirname, 'supabase', 'migrations', '00002_seed.sql'), 'utf8')
  await client.query(seedSql)
  console.log('Seed data inserted.')
  
  await client.end()
}

run().catch(err => {
  console.error('Migration failed:', err.message || err)
  process.exit(1)
})

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

const sql = fs.readFileSync(path.join(__dirname, 'supabase', 'migrations', '00001_schema.sql'), 'utf8')

async function run() {
  const client = new Client({
    host: process.env.SUPABASE_DB_HOST || 'aws-0-us-east-1.pooler.supabase.com',
    port: parseInt(process.env.SUPABASE_DB_PORT || '5432'),
    database: process.env.SUPABASE_DB_NAME || 'postgres',
    user: process.env.SUPABASE_DB_USER || 'postgres.gptlrwjefqyovtucvibs',
    password: process.env.SUPABASE_DB_PASSWORD,
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

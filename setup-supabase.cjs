const https = require('https')

const PAT = process.env.SUPABASE_PAT
const REF = process.env.SUPABASE_REF || 'gptlrwjefqyovtucvibs'

if (!PAT) { console.error('Set SUPABASE_PAT env var'); process.exit(1) }

async function runSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql })
    const req = https.request({
      hostname: 'api.supabase.com',
      path: `/v1/projects/${REF}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAT}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
      timeout: 30000,
    }, (res) => {
      let body = ''
      res.on('data', chunk => body += chunk)
      res.on('end', () => {
        try {
          resolve(JSON.parse(body))
        } catch {
          resolve(body)
        }
      })
    })
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

async function main() {
  // 1. Create storage buckets
  const buckets = ['property-images', 'avatars', 'cms']
  for (const bucket of buckets) {
    const check = await runSQL(`SELECT id FROM storage.buckets WHERE name = '${bucket}'`)
    if (Array.isArray(check) && check.length > 0) {
      console.log(`Bucket '${bucket}' already exists`)
      continue
    }
    const result = await runSQL(
      `INSERT INTO storage.buckets (id, name, public, file_size_limit) VALUES ('${bucket}', '${bucket}', true, 52428800) ON CONFLICT (id) DO NOTHING;`
    )
    // Create public policy
    try {
      await runSQL(
        `CREATE POLICY IF NOT EXISTS "Public Access ${bucket}" ON storage.objects FOR ALL USING (bucket_id = '${bucket}') WITH CHECK (bucket_id = '${bucket}')`
      )
    } catch(e) { /* ignore */ }
    console.log(`Created bucket '${bucket}'`)
  }

  // 2. Run migration
  const fs = require('fs')
  const path = require('path')
  const migrationPath = path.join(__dirname, 'supabase', 'migrations', '00001_schema.sql')
  const sql = fs.readFileSync(migrationPath, 'utf8')
  
  // Split into individual statements
  const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0)
  let ok = 0, skip = 0, err = 0
  
  for (const stmt of statements) {
    try {
      await runSQL(stmt + ';')
      ok++
    } catch(e) {
      const msg = e.message || String(e)
      if (msg.includes('already exists')) {
        skip++
      } else {
        console.error(`  Error: ${msg.slice(0, 120)}`)
        err++
      }
    }
  }
  console.log(`Migration: ${ok} ok, ${skip} skipped, ${err} errors`)

  console.log('Setup complete!')
}

main().catch(e => console.error('Failed:', e.message))

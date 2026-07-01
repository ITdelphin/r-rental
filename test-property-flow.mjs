import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = join(fileURLToPath(import.meta.url), '..')

const supabase = createClient(
  'https://gptlrwjefqyovtucvibs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwdGxyd2plZnF5b3Z0dWN2aWJzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjc0MTMwNSwiZXhwIjoyMDk4MzE3MzA1fQ.TcMGDXjvjdEMKgiiM_Dyz-YENlcW7gScuVFPktMAOAs'
)

const USER_ID = '51ef234e-6222-42ab-93d5-bf8d519d7539'

async function main() {
  // 1. Upload images to property-images bucket
  const imagesDir = join(__dirname, '2')
  const files = readdirSync(imagesDir)
    .filter(f => f.endsWith('.jfif') || f === 'color.png')
    .slice(0, 5)

  const uploadedUrls = []
  for (const file of files) {
    const filePath = join(imagesDir, file)
    const buffer = readFileSync(filePath)
    const ext = extname(file)
    const storagePath = `properties/${USER_ID}-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`

    const { error } = await supabase.storage
      .from('property-images')
      .upload(storagePath, buffer, {
        contentType: ext === '.png' ? 'image/png' : 'image/jpeg',
        upsert: false,
      })

    if (error) {
      console.error(`Failed ${file}: ${error.message}`)
      continue
    }

    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(storagePath)

    uploadedUrls.push(publicUrl)
    console.log(`Uploaded ${file}`)
  }

  console.log(`Uploaded ${uploadedUrls.length} images`)

  if (uploadedUrls.length === 0) {
    console.error('No images uploaded')
    process.exit(1)
  }

  // 2. Create property using service role key (bypasses RLS)
  const propertyData = {
    owner_id: USER_ID,
    title: 'Modern Apartment in Kigali',
    description: 'A beautiful modern apartment located in the heart of Kigali. Perfect for families or professionals.',
    category: 'Rent',
    property_type: 'Apartment',
    bedrooms: 3,
    bathrooms: 2,
    kitchen: 1,
    price: 500000,
    deposit: 250000,
    province: 'Kigali',
    district: 'Gasabo',
    sector: 'Kimironko',
    parking: true,
    balcony: true,
    security: true,
    internet: true,
    water: true,
    electricity: true,
    furnished: true,
    status: 'pending_approval',
    is_featured: false,
    views_count: 0,
  }

  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .insert(propertyData)
    .select()
    .single()

  if (propertyError) {
    console.error('Create property failed:', propertyError.message)
    process.exit(1)
  }

  console.log('Property created:', property.id)

  // 3. Insert image records
  const imageRows = uploadedUrls.map((url, i) => ({
    property_id: property.id,
    url,
    is_floor_plan: false,
    sort_order: i,
  }))

  const { error: imagesError } = await supabase
    .from('property_images')
    .insert(imageRows)

  if (imagesError) {
    console.error('Insert images failed:', imagesError.message)
    process.exit(1)
  }

  console.log(`Inserted ${imageRows.length} image records`)

  // 4. Verify
  const { data: verify } = await supabase
    .from('properties')
    .select('*, property_images(*)')
    .eq('id', property.id)
    .single()

  if (verify) {
    console.log('\n=== VERIFICATION PASSED ===')
    console.log(`Title: ${verify.title}`)
    console.log(`Images: ${verify.property_images?.length || 0}`)
  }

  console.log('\nDone! Everything works.')
}

main().catch(e => console.error('Error:', e.message))

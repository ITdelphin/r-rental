const fs = require('fs');
const https = require('https');

const PAT = process.env.SUPABASE_PAT;
if (!PAT) { console.error('SUPABASE_PAT env var required'); process.exit(1); }

const PROJECT = 'gptlrwjefqyovtucvibs';
const BATCH = 500;
const DATA_FILE = __dirname + '/locations-data.json';

if (!fs.existsSync(DATA_FILE)) {
  console.error('Run: node -e "const geo = require(\\'rwanda-geo\\'); fs.writeFileSync(\\'' + DATA_FILE + '\\', JSON.stringify({provinces:geo.getAllProvinces(),districts:geo.getAllDistricts(),sectors:geo.getAllSectors(),cells:geo.getAllCells(),villages:geo.getAllVillages()}))"');
  process.exit(1);
}

const raw = fs.readFileSync(DATA_FILE, 'utf8');
const data = JSON.parse(raw);

function query(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const req = https.request({
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT}/database/query`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAT}`,
        'Content-Type': 'application/json',
      },
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function seed() {
  const types = ['provinces', 'districts', 'sectors', 'cells', 'villages'];
  for (const type of types) {
    let items = data[type];
    console.log(`Seeding ${items.length} ${type}...`);
    for (let i = 0; i < items.length; i += BATCH) {
      const batch = items.slice(i, i + BATCH);
      const values = batch.map(item => {
        const code = item.code.replace(/'/g, "''");
        const name = item.name.replace(/'/g, "''");
        const slug = (item.slug || '').replace(/'/g, "''");
        const parent = (item.parentCode || '').replace(/'/g, "''");
        const levelType = type.slice(0, -1);
        const parentVal = parent ? `'${parent}'` : 'NULL';
        return `('${code}','${name}','${levelType}',${parentVal},'${slug}')`;
      }).join(',');
      const sql = `INSERT INTO locations (code, name, type, parent_code, slug) VALUES ${values} ON CONFLICT (code) DO NOTHING;`;
      await query(sql);
      process.stdout.write(`  ${Math.min(i + BATCH, items.length)}/${items.length}\r`);
    }
    console.log(`  ${type} done.`);
  }
  console.log('All seeded!');
}

seed().catch(console.error);

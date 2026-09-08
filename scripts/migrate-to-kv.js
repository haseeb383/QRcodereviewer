import fs from 'fs';
import path from 'path';
import { kvSet, kvGet } from '../lib/kv.js';

const DB_PATH = path.join(process.cwd(), 'cards.json');

async function main() {
  if (!fs.existsSync(DB_PATH)) {
    console.error('cards.json not found. Run locally first to create it.');
    process.exit(1);
  }
  
  const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  const cards = Object.values(data);
  
  console.log(`Migrating ${cards.length} cards to Vercel KV...`);
  
  let migrated = 0;
  for (const card of cards) {
    const key = `card:${card.card_id}`;
    const existing = await kvGet(key);
    if (!existing) {
      await kvSet(key, card);
      migrated++;
    }
  }
  
  console.log(`✓ Migrated ${migrated} new cards`);
  console.log(`✓ ${cards.length - migrated} cards already existed`);
  
  const test = await kvGet('card:001');
  console.log('\nVerification - card:001:', test);
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
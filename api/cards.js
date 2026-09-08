import { kv } from '@vercel/kv';

function checkAuth(req) {
  const auth = req.headers.authorization;
  const expected = `Bearer ${process.env.ADMIN_PASSWORD}`;
  return auth === expected;
}

export default async function handler(req, res) {
  if (!checkAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  if (req.method === 'GET') {
    const keys = await kv.keys('card:*');
    const cards = [];
    
    for (const key of keys) {
      const card = await kv.get(key);
      if (card) cards.push(card);
    }
    
    cards.sort((a, b) => a.card_id.localeCompare(b.card_id));
    return res.json(cards);
  }
  
  if (req.method === 'POST') {
    const { start, end } = req.body;
    const startNum = parseInt(start) || 1;
    const endNum = parseInt(end) || 100;
    
    let created = 0;
    for (let i = startNum; i <= endNum; i++) {
      const id = String(i).padStart(3, '0');
      const key = `card:${id}`;
      const existing = await kv.get(key);
      if (!existing) {
        const card = {
          card_id: id,
          destination_url: '',
          status: 'inactive',
          client_name: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        await kv.set(key, card);
        created++;
      }
    }
    
    return res.json({ message: `Generated ${created} new cards (${String(startNum).padStart(3, '0')} to ${String(endNum).padStart(3, '0')})` });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
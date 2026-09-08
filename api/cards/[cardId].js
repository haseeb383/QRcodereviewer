import { kvGet, kvSet } from '../../lib/kv.js';

function checkAuth(req) {
  const auth = req.headers.authorization;
  const expected = `Bearer ${process.env.ADMIN_PASSWORD}`;
  return auth === expected;
}

export default async function handler(req, res) {
  if (!checkAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { cardId } = req.query;
  const key = `card:${cardId}`;
  
  if (req.method === 'GET') {
    const card = await kvGet(key);
    if (!card) return res.status(404).json({ error: 'Card not found' });
    return res.json(card);
  }
  
  if (req.method === 'PUT') {
    const card = await kvGet(key);
    if (!card) return res.status(404).json({ error: 'Card not found' });
    
    const { destination_url, client_name, status } = req.body;
    
    const updated = {
      ...card,
      destination_url: destination_url ?? card.destination_url,
      client_name: client_name ?? card.client_name,
      status: status ?? card.status,
      updated_at: new Date().toISOString()
    };
    
    await kvSet(key, updated);
    return res.json(updated);
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
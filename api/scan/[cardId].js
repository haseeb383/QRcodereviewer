import { kvGet } from '../../lib/kv.js';

export default async function handler(req, res) {
  const { cardId } = req.query;
  
  if (!cardId) {
    return res.status(400).send('Card ID required');
  }
  
  const card = await kvGet(`card:${cardId}`);
  
  if (!card) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Card Not Found</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="font-family: system-ui; text-align: center; padding: 2rem;">
          <h1>❌ Card Not Found</h1>
          <p>Card ID <strong>${cardId}</strong> does not exist.</p>
        </body>
      </html>
    `);
  }
  
  if (card.status === 'active' && card.destination_url) {
    return res.redirect(302, card.destination_url);
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Card Ready for Activation</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: system-ui; text-align: center; padding: 2rem; background: #f5f5f5; }
          .card { background: white; max-width: 400px; margin: 2rem auto; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #333; }
          .status { color: #e67e22; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>📋 Card Awaiting Activation</h1>
          <p>Card ID: <strong>${card.card_id}</strong></p>
          <p class="status">This card is ready to be assigned to a business.</p>
          <p>Contact your sales agent to activate this review card.</p>
        </div>
      </body>
    </html>
  `);
}
const express = require('express');
const path = require('path');
const { getAllCards, getCard, updateCard, createCards } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.get('/scan/:cardId', (req, res) => {
  const { cardId } = req.params;
  const card = getCard(cardId);

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
});

app.get('/api/cards', requireAuth, (req, res) => {
  res.json(getAllCards());
});

app.get('/api/cards/:cardId', requireAuth, (req, res) => {
  const card = getCard(req.params.cardId);
  if (!card) return res.status(404).json({ error: 'Card not found' });
  res.json(card);
});

app.put('/api/cards/:cardId', requireAuth, (req, res) => {
  const { cardId } = req.params;
  const { destination_url, client_name, status } = req.body;

  const card = getCard(cardId);
  if (!card) return res.status(404).json({ error: 'Card not found' });

  const updated = updateCard(cardId, {
    destination_url: destination_url || card.destination_url,
    client_name: client_name || card.client_name,
    status: status || card.status
  });
  
  res.json(updated);
});

app.post('/api/cards/batch', requireAuth, (req, res) => {
  const { start, end } = req.body;
  const startNum = parseInt(start) || 1;
  const endNum = parseInt(end) || 100;

  const created = createCards(startNum, endNum);
  res.json({ message: `Generated ${created} new cards (${String(startNum).padStart(3, '0')} to ${String(endNum).padStart(3, '0')})` });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Admin dashboard: http://localhost:${PORT}/admin.html`);
  console.log(`Scan endpoint: http://localhost:${PORT}/scan/001`);
  console.log(`Default admin password: ${ADMIN_PASSWORD}`);
});
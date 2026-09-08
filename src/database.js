const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'cards.json');

function loadDB() {
  if (!fs.existsSync(DB_PATH)) {
    const initial = {};
    for (let i = 1; i <= 100; i++) {
      const id = String(i).padStart(3, '0');
      initial[id] = {
        card_id: id,
        destination_url: '',
        status: 'inactive',
        client_name: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
    saveDB(initial);
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

const db = loadDB();

function getAllCards() {
  return Object.values(db).sort((a, b) => a.card_id.localeCompare(b.card_id));
}

function getCard(cardId) {
  return db[cardId] || null;
}

function updateCard(cardId, data) {
  if (!db[cardId]) return null;
  
  db[cardId] = {
    ...db[cardId],
    ...data,
    updated_at: new Date().toISOString()
  };
  saveDB(db);
  return db[cardId];
}

function createCards(start, end) {
  let created = 0;
  for (let i = start; i <= end; i++) {
    const id = String(i).padStart(3, '0');
    if (!db[id]) {
      db[id] = {
        card_id: id,
        destination_url: '',
        status: 'inactive',
        client_name: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      created++;
    }
  }
  saveDB(db);
  return created;
}

module.exports = { getAllCards, getCard, updateCard, createCards };
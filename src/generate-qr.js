import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.BASE_URL || 'https://qr-reviewer.vercel.app';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'qr');
const START = parseInt(process.argv[2]) || 1;
const END = parseInt(process.argv[3]) || 100;

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateQR(cardId) {
  const url = `${BASE_URL}/scan/${cardId}`;
  const filePath = path.join(OUTPUT_DIR, `${cardId}.png`);
  
  await QRCode.toFile(filePath, url, {
    width: 400,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  });
  
  return { cardId, url, filePath };
}

async function main() {
  console.log(`Generating QR codes for ${String(START).padStart(3, '0')} to ${String(END).padStart(3, '0')}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  for (let i = START; i <= END; i++) {
    const cardId = String(i).padStart(3, '0');
    try {
      const result = await generateQR(cardId);
      console.log(`✓ ${cardId} -> ${result.url}`);
    } catch (err) {
      console.error(`✗ ${cardId} failed:`, err.message);
    }
  }

  console.log('\nDone! QR codes saved to public/qr/');
}

main();
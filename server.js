const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

function loadCredentials() {
  if (process.env.GOOGLE_CREDENTIALS) {
    return JSON.parse(process.env.GOOGLE_CREDENTIALS);
  }
  if (process.env.GOOGLE_CREDENTIALS_BASE64) {
    const jsonStr = Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf8');
    return JSON.parse(jsonStr);
  }
  throw new Error('No Google credentials found in env');
}

const credentials = loadCredentials();
const spreadsheetId = process.env.SPREADSHEET_ID;
if (!spreadsheetId) {
  console.error('Missing SPREADSHEET_ID');
  process.exit(1);
}

const auth = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  ['https://www.googleapis.com/auth/spreadsheets']
);
const sheets = google.sheets({ version: 'v4', auth });

app.post('/submit', async (req, res) => {
  try {
    const { height_cm, weight_kg, notes } = req.body;
    if (!height_cm || !weight_kg) {
      return res.status(400).json({ error: 'height_cm and weight_kg are required' });
    }
    const timestamp = new Date().toISOString();
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:E',
      valueInputOption: 'RAW',
      requestBody: { values: [[timestamp, height_cm, weight_kg, notes || '', ip]] }
    });
    res.json({ ok: true, message: 'Saved to Google Sheet' });
  } catch (err) {
    console.error('Error saving:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/health', (req, res) => res.send('ok'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // Only use this when your reverse proxy overwrites X-Forwarded-For.

// IMPORTANT: keep authoritative prices and IDs on the server/database.
// Never put them in browser JavaScript or hidden HTML fields.
const cards = [
  { name: 'Smokemon', priceCents: 2500, id: process.env.SMOEKMON_CARD_ID || 'REPLACE_WITH_PRIVATE_CARD_ID' }
];

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: []
    }
  },
  referrerPolicy: { policy: 'no-referrer' },
  crossOriginEmbedderPolicy: false
}));

app.use(express.json({ limit: '8kb' }));
app.use(express.static(path.join(__dirname), {
  dotfiles: 'deny',
  etag: true,
  maxAge: '1h'
}));

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many searches. Please try again shortly.' }
});

app.get('/api/cards/search', searchLimiter, (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (!q || q.length > 64) return res.status(400).json({ error: 'Invalid search.' });

  const needle = q.toLowerCase();
  const items = cards
    .filter(card => card.name.toLowerCase().includes(needle) || card.id.includes(q))
    .slice(0, 10)
    .map(card => ({
      name: card.name,
      id: maskId(card.id),
      // This value is authoritative because it came from the server/database.
      price: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(card.priceCents / 100)
    }));

  res.set('Cache-Control', 'no-store');
  res.json({ items });
});

function maskId(id) {
  // Do not expose an entire identifier unless there is a business reason to do so.
  return id.length <= 4 ? '••••' : `••••${id.slice(-4)}`;
}

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`HyperCards listening on port ${port}`));

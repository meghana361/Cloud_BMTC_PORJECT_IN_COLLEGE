const express = require('express');
const mysql = require('mysql2/promise'); // ✅ USE PROMISE VERSION
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET'],
}));

const db = mysql.createPool({ // ✅ use createPool
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.get('/routes', async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: 'from and to query params required' });
  }

  try {
    const [results] = await db.query('SELECT * FROM Route');

    const matchingRoutes = results
      .map(route => {
        const stopListRaw = route.stop_list?.toString('utf8') || '';
        const stopList = stopListRaw.split(',').map(s => s.trim());

        const fromIndex = stopList.indexOf(from);
        const toIndex = stopList.indexOf(to);

        if (fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex) {
          return {
            route_id: route.id,
            route_name: route.name,
            direction_id: route.direction_id,
            hops: stopList.slice(fromIndex, toIndex + 1)
          };
        }
        return null;
      })
      .filter(route => route !== null);

    res.json(matchingRoutes);
  } catch (err) {
    console.error('Error fetching routes:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/stops', async (req, res) => {
  try {
    const [results] = await db.query('SELECT stop_list FROM Route');

    const allStops = new Set();

    results.forEach(route => {
      const stopListRaw = route.stop_list?.toString('utf8') || '';
      const stopList = stopListRaw.split(',').map(s => s.trim());
      stopList.forEach(stop => {
        if (stop) allStops.add(stop);
      });
    });

    res.json(Array.from(allStops));
  } catch (err) {
    console.error('Error fetching stops:', err);
    res.status(500).json({ error: 'Failed to fetch stops' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});

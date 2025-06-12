const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root', // your actual MySQL password
  database: 'busstops_db'
});

// GET /routes?from=A&to=B
app.get('/routes', (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: 'from and to query params required' });
  }

  db.query('SELECT * FROM Route', (err, results) => {
    if (err) {
      console.error('Error fetching routes:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    const matchingRoutes = results
      .map(route => {
        // Convert buffer to string and split
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
        } else {
          return null; // No match
        }
      })
      .filter(route => route !== null);

    res.json(matchingRoutes);
  });
});



// GET /stops
app.get('/stops', (req, res) => {
  db.query('SELECT stop_list FROM Route', (err, results) => {
    if (err) {
      console.error('Error fetching stops:', err);
      return res.status(500).json({ error: 'Failed to fetch stops' });
    }

    const allStops = new Set();

    results.forEach(route => {
      // Convert buffer to string and split by commas
      const stopListRaw = route.stop_list?.toString('utf8') || '';
      const stopList = stopListRaw.split(',').map(s => s.trim());

      stopList.forEach(stop => {
        if (stop) {
          allStops.add(stop);
        }
      });
    });

    res.json(Array.from(allStops));
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});

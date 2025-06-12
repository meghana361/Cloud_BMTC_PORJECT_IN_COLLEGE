const fs = require('fs');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const results = [];

  fs.createReadStream('../stops.csv')
    .pipe(csv())
    .on('data', (data) => {
      // Parse JSON strings from CSV columns (trip_list, route_list)
      data.trip_list = JSON.parse(data.trip_list.replace(/""/g, '"'));
      data.route_list = JSON.parse(data.route_list.replace(/""/g, '"'));
      data.trip_count = parseInt(data.trip_count);
      data.route_count = parseInt(data.route_count);
      data.id = data.id.toString();

      results.push(data);
    })
    .on('end', async () => {
      console.log('CSV parsed, importing into DB...');
      for (const row of results) {
        await prisma.stop.upsert({
          where: { id: row.id },
          update: row,
          create: row,
        });
      }
      console.log('Import done!');
      await prisma.$disconnect();
    });
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
});

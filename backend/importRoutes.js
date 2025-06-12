const fs = require('fs');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const results = [];
  let totalRows = 0;
  let skippedRows = 0;
  let importedRows = 0;

  return new Promise((resolve, reject) => {
    fs.createReadStream('../routes.csv')
      .pipe(csv())
      .on('data', (data) => {
        totalRows++;
        try {
          // Fix double quotes and parse JSON fields
          data.trip_list = JSON.parse(data.trip_list.replace(/""/g, '"'));
          data.stop_list = JSON.parse(data.stop_list.replace(/""/g, '"'));

          // Convert to correct types
          data.trip_count = parseInt(data.trip_count);
          data.stop_count = parseInt(data.stop_count);
          data.id = data.id.toString();

          const parsedDirection = parseInt(data.direction_id);
          data.direction_id = isNaN(parsedDirection) ? 0 : parsedDirection;

          results.push(data);
        } catch (err) {
          console.error('❌ Failed to parse row:', data.id, err.message);
          skippedRows++;
        }
      })
      .on('end', async () => {
        console.log(`✅ CSV parsed. Total rows: ${totalRows}`);
        console.log('📥 Importing into DB...');

        try {
          for (const row of results) {
            try {
              await prisma.route.upsert({
                where: { id: row.id },
                update: row,
                create: row,
              });
              importedRows++;
            } catch (err) {
              console.error(`❌ Error upserting row with id ${row.id}:`, err.message);
              skippedRows++;
            }
          }

          console.log(`✅ Import complete.`);
          console.log(`📦 Imported: ${importedRows}`);
          console.log(`⚠️ Skipped or failed: ${skippedRows}`);
          await prisma.$disconnect();
          resolve();
        } catch (err) {
          reject(err);
        }
      })
      .on('error', (err) => {
        console.error('❌ Stream error:', err.message);
        reject(err);
      });
  });
}

main().catch(e => {
  console.error('❌ Unhandled error:', e.message);
  prisma.$disconnect();
});

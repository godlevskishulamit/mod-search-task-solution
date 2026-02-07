import fs from 'fs';
import path from 'path';
import { Client } from '@elastic/elasticsearch';
import csvParser from 'csv-parser';

const client = new Client({ node: 'http://localhost:9200' });
const indexName = 'streets';

async function ingestCSV(filePath: string) {
  const bulkOps: any[] = [];

  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser({ separator: ',' }))
      .on('data', (row) => {
        bulkOps.push(
          { index: { _index: indexName } },
          {
            main_name: row['שם ראשי'],
            title: row['תואר'],
            secondary_name: row['שם משני'],
            group: row['קבוצה'],
            additional_group: row['קבוצה נוספת'],
            type: row['סוג'],
            code: row['קוד'],
            neighborhood: row['שכונה'],
            is_deleted: false,
          }
        );
      })
      .on('end', async () => {
        try {
          await client.bulk({ body: bulkOps });
          console.log('Data successfully ingested.');
          resolve();
        } catch (error) {
          console.error('Error during bulk upload:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV file:', error);
        reject(error);
      });
  });
}

(async () => {
  const csvPath = path.resolve(__dirname, 'data.csv'); // Replace with actual CSV path
  try {
    await ingestCSV(csvPath);
  } catch (error) {
    console.error('Failed to ingest CSV:', error);
  }
})();
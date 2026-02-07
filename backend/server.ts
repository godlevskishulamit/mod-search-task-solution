import express from 'express';
import { Client } from '@elastic/elasticsearch';
import fs from 'fs';
import csv from 'csv-parser';
const http = require('http');

const app = express();
const port = 5000;
const client = new Client({ node: 'http://localhost:9200' });
const indexName = 'streets';

app.use(express.json());

// Search Endpoint
app.get('/search', async (req, res) => {
  const { q, mode } = req.query;

  if (!q || !mode) {
    return res.status(400).send('Missing query or mode');
  }

  let query;
  switch (mode) {
    case 'free':
      query = {
        match: {
          main_name: q,
        },
      };
      break;
    case 'accurate':
      query = {
        multi_match: {
          query: q,
          fields: ['main_name', 'title', 'secondary_name', 'group', 'additional_group', 'type', 'code', 'neighborhood'],
        },
      };
      break;
    case 'phrase':
      query = {
        match_phrase: {
          main_name: q,
        },
      };
      break;
    default:
      return res.status(400).send('Invalid mode');
  }

  try {
    const { body } = await client.search({
      index: indexName,
      body: {
        query: {
          bool: {
            must: query,
            must_not: {
              term: { is_deleted: true },
            },
          },
        },
      },
    });

    const results = body.hits.hits.map((hit: any) => hit._source);
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).send('Error performing search');
  }
});

// Delete Endpoint
app.patch('/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await client.update({
      index: indexName,
      id,
      body: {
        doc: { is_deleted: true },
      },
    });
    res.send('Document marked as deleted');
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).send('Error deleting document');
  }
});

// Endpoint to load CSV to Elasticsearch
app.post('/load-csv', async (req, res) => {
  const filePath = req.body.filePath; // Expecting filePath in the request body

  if (!filePath) {
    return res.status(400).send('Missing file path');
  }

  const bulkOperations: any[] = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => {
      bulkOperations.push({ index: { _index: indexName } });
      bulkOperations.push(data);
    })
    .on('end', async () => {
      try {
        const { body } = await client.bulk({
          refresh: true,
          body: bulkOperations,
        });

        res.send(`Successfully loaded ${body.items.length} items to Elasticsearch`);
      } catch (error) {
        console.error('Error loading CSV:', error);
        res.status(500).send('Error loading CSV to Elasticsearch');
      }
    })
    .on('error', (error) => {
      console.error('Error reading CSV file:', error);
      res.status(500).send('Error reading CSV file');
    });
});

const hostname = '127.0.0.1';

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end('<h1>ברוך הבא לשרת ב-Node.js נקי</h1>');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
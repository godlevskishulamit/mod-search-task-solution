const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');
const csv = require('csv-parser');
const cors = require('cors');

const app = express();
const port = 5000;
const indexName = 'streets';

// Elasticsearch client (inside Docker uses service name "elasticsearch")
const client = new Client({ node: 'http://elasticsearch:9200' });

client.ping((error) => {
  if (error) {
    console.error('Elasticsearch cluster is down!');
  } else {
    console.log('Elasticsearch is connected.');
  }
});

app.use(express.json());
app.use(cors());

// Simple root route so opening http://localhost:5000 יראה משהו
app.get('/', (req, res) => {
  res.send('<h1>ברוך הבא לשרת Express עם Swagger</h1>');
});

// ----------------- API ENDPOINTS -----------------

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Search streets index
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: The search query
 *       - in: query
 *         name: mode
 *         required: true
 *         schema:
 *           type: string
 *           enum: [free, accurate, phrase]
 *         description: Search mode
 *     responses:
 *       200:
 *         description: List of results
 *       400:
 *         description: Missing query or mode
 *       500:
 *         description: Error performing search
 */
app.get('/search', async (req, res) => {
  const { q, mode } = req.query;

  if (!q || !mode) {
    return res.status(400).send('Missing query or mode');
  }

  let query;
  switch (mode) {
    case 'free':
      query = { match: { main_name: q } };
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
      query = { match_phrase: { main_name: q } };
      break;
    default:
      return res.status(400).send('Invalid mode');
  }

  try {
    const { body } = await client.search({
      index: indexName,
      size: 6, // מחזיר לכל היותר 6 תוצאות
      body: {
        query: {
          bool: {
            must: query,
            must_not: { term: { is_deleted: true } },
          },
        },
      },
    });

    const results = body.hits.hits.map((hit) => ({
      id: hit._id,
      ...hit._source,
    }));
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).send('Error performing search');
  }
});

/**
 * @swagger
 * /delete/{id}:
 *   patch:
 *     summary: Soft delete document by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document marked as deleted
 *       500:
 *         description: Error deleting document
 */
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

/**
 * @swagger
 * /load-csv:
 *   post:
 *     summary: Load data from CSV file into Elasticsearch
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filePath:
 *                 type: string
 *                 description: Absolute path to CSV file inside backend container
 *     responses:
 *       200:
 *         description: Data loaded successfully
 *       400:
 *         description: Missing file path
 *       500:
 *         description: Error loading CSV
 */
app.post('/load-csv', async (req, res) => {
  const filePath = req.body.filePath;

  if (!filePath) {
    return res.status(400).send('Missing file path');
  }

  const bulkOperations = [];
  // Expect CSV with Hebrew headers like in ingest.ts
  // "שם ראשי", "תואר", "שם משני", "קבוצה", "קבוצה נוספת", "סוג", "קוד", "שכונה"
  const readStream = fs.createReadStream(filePath);

  readStream.on('error', (error) => {
    console.error('Error opening CSV file:', error);
    return res.status(500).send('Error opening CSV file (check path and file name)');
  });

  readStream
    .pipe(csv({ separator: ',' }))
    .on('data', (row) => {
      const doc = {
        main_name: row['שם ראשי'],
        title: row['תואר'],
        secondary_name: row['שם משני'],
        group: row['קבוצה'],
        additional_group: row['קבוצה נוספת'],
        type: row['סוג'],
        code: row['קוד'],
        neighborhood: row['שכונה'],
        is_deleted: false,
      };

      bulkOperations.push({ index: { _index: indexName } });
      bulkOperations.push(doc);
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

// ----------------- SWAGGER SETUP -----------------

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Streets API',
      version: '1.0.0',
      description: 'API documentation for streets search service',
    },
  },
  apis: ['./server.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Start Express server
app.listen(port, '0.0.0.0', () => {
  console.log(`Express server with Swagger running at http://0.0.0.0:${port}/`);
});
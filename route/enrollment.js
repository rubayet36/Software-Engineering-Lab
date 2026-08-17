const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const DB_FILE = path.join(__dirname, '../enrollments.json');

function loadDB() {
  if (!fs.existsSync(DB_FILE)) return { enrollments: [] };
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Security Middleware: X-API-Key header check
router.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== 'secret123') {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid API key' });
  }
  next();
});

// 1. Retrieve — GET /api/enrollments (All & Filtered)
router.get('/', (req, res) => {
  const db = loadDB();
  let results = db.enrollments || [];
  const { courseCode, status } = req.query;

  if (courseCode) {
    results = results.filter(e => e.courseCode === courseCode);
  }
  if (status) {
    results = results.filter(e => e.status === status);
  }

  res.json(results);
});

// 2. Retrieve one — GET /api/enrollments/:id
router.get('/:id', (req, res) => {
  const db = loadDB();
  const id = parseInt(req.params.id, 10);
  const enrollment = db.enrollments.find(e => e.id === id);

  if (!enrollment) {
    return res.status(404).json({ error: 'Enrollment not found' });
  }

  res.json(enrollment);
});

module.exports = router;

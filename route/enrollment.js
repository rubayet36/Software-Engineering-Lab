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

// 3. Save — POST /api/enrollments
router.post('/', (req, res) => {
  const { studentName, courseCode, semester, status } = req.body;

  if (!studentName || !courseCode) {
    return res.status(400).json({ error: 'studentName and courseCode are required fields' });
  }

  const db = loadDB();
  const maxId = db.enrollments.reduce((max, e) => (e.id > max ? e.id : max), 0);
  const newId = maxId + 1;

  const newEnrollment = {
    id: newId,
    studentName,
    courseCode,
    semester: semester || 'Fall2026',
    status: status || 'enrolled'
  };

  db.enrollments.push(newEnrollment);
  saveDB(db);

  res.status(201).json(newEnrollment);
});

// 4. Update — PUT /api/enrollments/:id
router.put('/:id', (req, res) => {
  const db = loadDB();
  const id = parseInt(req.params.id, 10);
  const index = db.enrollments.findIndex(e => e.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Enrollment not found' });
  }

  if (req.body.status !== undefined) {
    db.enrollments[index].status = req.body.status;
  }
  if (req.body.studentName !== undefined) {
    db.enrollments[index].studentName = req.body.studentName;
  }
  if (req.body.courseCode !== undefined) {
    db.enrollments[index].courseCode = req.body.courseCode;
  }
  if (req.body.semester !== undefined) {
    db.enrollments[index].semester = req.body.semester;
  }

  saveDB(db);
  res.json(db.enrollments[index]);
});

// 5. Delete — DELETE /api/enrollments/:id
router.delete('/:id', (req, res) => {
  const db = loadDB();
  const id = parseInt(req.params.id, 10);
  const index = db.enrollments.findIndex(e => e.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Enrollment not found' });
  }

  const deleted = db.enrollments.splice(index, 1)[0];
  saveDB(db);

  res.json({ message: 'Enrollment deleted successfully', deleted });
});

module.exports = router;

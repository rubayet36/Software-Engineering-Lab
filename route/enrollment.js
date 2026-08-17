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

module.exports = router;

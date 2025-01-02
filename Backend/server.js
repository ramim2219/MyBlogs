const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// MySQL connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',  // Use your MySQL username
  password: '',  // Use your MySQL password
  database: 'problemsDB'
});

// Connect to MySQL
db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

// Routes

// Get all problems
app.get('/api/problems', (req, res) => {
  const query = 'SELECT * FROM problems';
  db.query(query, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// Add a new problem
app.post('/api/problems', (req, res) => {
  const { Name, Link, Type, TopicName } = req.body;
  const query = 'INSERT INTO problems (Name, Link, Type, TopicName) VALUES (?, ?, ?, ?)';
  db.query(query, [Name, Link, Type, TopicName], (err, result) => {
    if (err) throw err;
    res.json({ message: 'Problem added', id: result.insertId });
  });
});

// Update a problem
app.put('/api/problems/:id', (req, res) => {
  const { Name, Link, Type, TopicName } = req.body;
  const query = 'UPDATE problems SET Name = ?, Link = ?, Type = ?, TopicName = ? WHERE id = ?';
  db.query(query, [Name, Link, Type, TopicName, req.params.id], (err, result) => {
    if (err) throw err;
    res.json({ message: 'Problem updated' });
  });
});

// Delete a problem
app.delete('/api/problems/:id', (req, res) => {
  const query = 'DELETE FROM problems WHERE id = ?';
  db.query(query, [req.params.id], (err, result) => {
    if (err) throw err;
    res.json({ message: 'Problem deleted' });
  });
});

// Start server
app.listen(5000, () => console.log('Server running on port 5000'));

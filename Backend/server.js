const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// MySQL connection pool setup
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',  // Use your MySQL username
  password: '',  // Use your MySQL password
  database: 'problemsDB', // Ensure this matches your database
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Routes

// Get all problems
app.get('/api/problems', (req, res) => {
  const query = 'SELECT * FROM problems';
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching problems:', err);
      return res.status(500).json({ message: 'Failed to fetch problems' });
    }
    res.json(result);
  });
});

// Add a new problem
app.post('/api/problems', (req, res) => {
  const { Name, Link, Type, TopicName, Explanation, Code, Video_link } = req.body;
  const query = 'INSERT INTO problems (Name, Link, Type, TopicName, Explanation, Code, Video_link) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [
    Name,
    Link,
    Type,
    TopicName,
    Explanation || '', // If Explanation is not provided, set it as NULL
    Code || '',         // If Code is not provided, set it as NULL
    Video_link || ''    // If Video_link is not provided, set it as NULL
  ], (err, result) => {
    if (err) {
      console.error('Error adding problem:', err);
      return res.status(500).json({ message: 'Failed to add problem' });
    }
    res.json({ message: 'Problem added', id: result.insertId });
  });
});

// Update a problem
app.put('/api/problems/:id', (req, res) => {
  const { Name, Link, Type, TopicName, Explanation, Code, Video_link } = req.body;
  const query = 'UPDATE problems SET Name = ?, Link = ?, Type = ?, TopicName = ?, Explanation = ?, Code = ?, Video_link = ? WHERE id = ?';
  db.query(query, [
    Name,
    Link,
    Type,
    TopicName,
    Explanation || '', // If Explanation is not provided, set it as NULL
    Code || '',         // If Code is not provided, set it as NULL
    Video_link || '',   // If Video_link is not provided, set it as NULL
    req.params.id
  ], (err, result) => {
    if (err) {
      console.error('Error updating problem:', err);
      return res.status(500).json({ message: 'Failed to update problem' });
    }
    res.json({ message: 'Problem updated' });
  });
});

// Delete a problem
app.delete('/api/problems/:id', (req, res) => {
  const query = 'DELETE FROM problems WHERE id = ?';
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      console.error('Error deleting problem:', err);
      return res.status(500).json({ message: 'Failed to delete problem' });
    }
    res.json({ message: 'Problem deleted' });
  });
});

// Get all concepts
app.get('/api/concepts', (req, res) => {
  const query = 'SELECT * FROM concepts';
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching concepts:', err);
      return res.status(500).json({ message: 'Failed to fetch concepts' });
    }
    res.json(result);
  });
});

// Add a new concept
app.post('/api/concepts', (req, res) => {
  const { topic, explanationEnglish, explanationBangla, code, input, output, subTopic } = req.body;
  const query = 'INSERT INTO concepts (topic, explanationEnglish, explanationBangla, code, input, output, subTopic) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [
    topic,
    explanationEnglish || '',
    explanationBangla || '',
    code || '',
    input || '',
    output || '',
    subTopic || ''
  ], (err, result) => {
    if (err) {
      console.error('Error adding concept:', err);
      return res.status(500).json({ message: 'Failed to add concept' });
    }
    res.json({ message: 'Concept added', id: result.insertId });
  });
});

// Update a concept
app.put('/api/concepts/:id', (req, res) => {
  const { topic, explanationEnglish, explanationBangla, code, input, output, subTopic } = req.body;
  const query = 'UPDATE concepts SET topic = ?, explanationEnglish = ?, explanationBangla = ?, code = ?, input = ?, output = ?, subTopic = ? WHERE id = ?';
  db.query(query, [
    topic,
    explanationEnglish || '',
    explanationBangla || '',
    code || '',
    input || '',
    output || '',
    subTopic || '',
    req.params.id
  ], (err, result) => {
    if (err) {
      console.error('Error updating concept:', err);
      return res.status(500).json({ message: 'Failed to update concept' });
    }
    res.json({ message: 'Concept updated' });
  });
});

// Delete a concept
app.delete('/api/concepts/:id', (req, res) => {
  const query = 'DELETE FROM concepts WHERE id = ?';
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      console.error('Error deleting concept:', err);
      return res.status(500).json({ message: 'Failed to delete concept' });
    }
    res.json({ message: 'Concept deleted' });
  });
});


// Get all resources
app.get('/api/resources', (req, res) => {
  const query = 'SELECT * FROM resources';
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching resources:', err);
      return res.status(500).json({ message: 'Failed to fetch resources' });
    }
    res.json(result);
  });
});

// Add a new resource
app.post('/api/resources', (req, res) => {
  const { title, link, topic } = req.body;
  const query = 'INSERT INTO resources (title, link, topic) VALUES (?, ?, ?)';
  db.query(query, [title, link, topic], (err, result) => {
    if (err) {
      console.error('Error adding resource:', err);
      return res.status(500).json({ message: 'Failed to add resource' });
    }
    res.json({ message: 'Resource added', id: result.insertId });
  });
});

// Update a resource
app.put('/api/resources/:id', (req, res) => {
  const { title, link, topic } = req.body;
  const query = 'UPDATE resources SET title = ?, link = ?, topic = ? WHERE id = ?';
  db.query(query, [title, link, topic, req.params.id], (err, result) => {
    if (err) {
      console.error('Error updating resource:', err);
      return res.status(500).json({ message: 'Failed to update resource' });
    }
    res.json({ message: 'Resource updated' });
  });
});

// Delete a resource
app.delete('/api/resources/:id', (req, res) => {
  const query = 'DELETE FROM resources WHERE id = ?';
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      console.error('Error deleting resource:', err);
      return res.status(500).json({ message: 'Failed to delete resource' });
    }
    res.json({ message: 'Resource deleted' });
  });
});

// Start server
app.listen(5000, () => console.log('Server running on port 5000')).on('error', (err) => {
  console.error('Error starting server:', err);
});

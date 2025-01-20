const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

const storage = multer.diskStorage({
  destination: (req,file,cb)=>{
    cb(null, '../BlogSite/public/images')
  },
  filename : (req,file,cb)=>{
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
  }
})

const upload = multer ({
  storage : storage
})

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

app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file || !req.body.exercise || !req.body.solution || !req.body.topic_id) {
    return res.status(400).json({ message: 'No file or missing exercise/solution/topic_id' });
  }
  
  const imagePath = req.file.filename;
  const { exercise, solution, topic_id } = req.body;

  // Inserting the image, exercise, solution, and topic_id into the database
  const query = 'INSERT INTO contents (image, exercise, solution, topic_id) VALUES (?, ?, ?, ?)';

  db.query(query, [imagePath, exercise, solution, topic_id], (err, result) => {
    if (err) {
      console.error('Error saving file info to database:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.status(200).json({
      message: 'File uploaded and saved successfully',
      fileId: result.insertId,
      fileName: imagePath
    });
  });
});

// Show all contents
app.get('/contents', (req, res) => {
  const query = 'SELECT * FROM contents';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching contents:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.status(200).json(results);
  });
});
// Endpoint to fetch all contents based on a specific topic_id
app.get('/contents/:topic_id', (req, res) => {
  const { topic_id } = req.params;
  const query = 'SELECT * FROM contents WHERE topic_id = ?';
  
  db.query(query, [topic_id], (err, results) => {
    if (err) {
      console.error('Error fetching contents:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.status(200).json(results);
  });
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

// Routes for Courses
app.get('/api/courses', (req, res) => {
  const query = 'SELECT * FROM Courses';
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching courses:', err);
      return res.status(500).json({ message: 'Failed to fetch courses' });
    }
    res.json(result);
  });
});

app.post('/api/courses', (req, res) => {
  const { title, description } = req.body;  // Changed name to title
  const query = 'INSERT INTO Courses (title, description) VALUES (?, ?)';  // Changed name to title
  db.query(query, [title, description || ''], (err, result) => {
    if (err) {
      console.error('Error adding course:', err);
      return res.status(500).json({ message: 'Failed to add course' });
    }
    res.json({ message: 'Course added', id: result.insertId });
  });
});

app.put('/api/courses/:id', (req, res) => {
  const { title, description } = req.body;  // Changed name to title
  const query = 'UPDATE Courses SET title = ?, description = ? WHERE id = ?';  // Changed name to title
  db.query(query, [title, description || '', req.params.id], (err, result) => {
    if (err) {
      console.error('Error updating course:', err);
      return res.status(500).json({ message: 'Failed to update course' });
    }
    res.json({ message: 'Course updated' });
  });
});

app.delete('/api/courses/:id', (req, res) => {
  const query = 'DELETE FROM Courses WHERE id = ?';
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      console.error('Error deleting course:', err);
      return res.status(500).json({ message: 'Failed to delete course' });
    }
    res.json({ message: 'Course deleted' });
  });
});

// Get all chapters
app.get('/api/chapters', (req, res) => {
  const query = 'SELECT * FROM Chapters';
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching chapters:', err);
      return res.status(500).json({ message: 'Failed to fetch chapters' });
    }
    res.json(result);
  });
});

// Add a new chapter
app.post('/api/chapters', (req, res) => {
  const { course_id, name } = req.body;
  const query = 'INSERT INTO Chapters (course_id, name) VALUES (?, ?)';
  db.query(query, [course_id, name], (err, result) => {
    if (err) {
      console.error('Error adding chapter:', err);
      return res.status(500).json({ message: 'Failed to add chapter' });
    }
    res.json({ message: 'Chapter added', id: result.insertId });
  });
});

// Update a chapter
app.put('/api/chapters/:id', (req, res) => {
  const { course_id, name } = req.body;
  const query = 'UPDATE Chapters SET course_id = ?, name = ? WHERE id = ?';
  db.query(query, [course_id, name, req.params.id], (err, result) => {
    if (err) {
      console.error('Error updating chapter:', err);
      return res.status(500).json({ message: 'Failed to update chapter' });
    }
    res.json({ message: 'Chapter updated' });
  });
});

// Delete a chapter
app.delete('/api/chapters/:id', (req, res) => {
  const query = 'DELETE FROM Chapters WHERE id = ?';
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      console.error('Error deleting chapter:', err);
      return res.status(500).json({ message: 'Failed to delete chapter' });
    }
    res.json({ message: 'Chapter deleted' });
  });
});


// Get all topics
app.get('/api/topics', (req, res) => {
  const query = 'SELECT * FROM Topics';
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching topics:', err);
      return res.status(500).json({ message: 'Failed to fetch topics' });
    }
    res.json(result);
  });
});

// Add a new topic
app.post('/api/topics', (req, res) => {
  const { chapter_id, name, explanation } = req.body;
  const query = 'INSERT INTO Topics (chapter_id, name, explanation) VALUES (?, ?, ?)';
  db.query(query, [chapter_id, name, explanation], (err, result) => {
    if (err) {
      console.error('Error adding topic:', err);
      return res.status(500).json({ message: 'Failed to add topic' });
    }
    res.json({ message: 'Topic added', id: result.insertId });
  });
});

// Update a topic
app.put('/api/topics/:id', (req, res) => {
  const { chapter_id, name, explanation } = req.body;
  const query = 'UPDATE Topics SET chapter_id = ?, name = ?, explanation = ? WHERE id = ?';
  db.query(query, [chapter_id, name, explanation, req.params.id], (err, result) => {
    if (err) {
      console.error('Error updating topic:', err);
      return res.status(500).json({ message: 'Failed to update topic' });
    }
    res.json({ message: 'Topic updated' });
  });
});

// Delete a topic
app.delete('/api/topics/:id', (req, res) => {
  const query = 'DELETE FROM Topics WHERE id = ?';
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      console.error('Error deleting topic:', err);
      return res.status(500).json({ message: 'Failed to delete topic' });
    }
    res.json({ message: 'Topic deleted' });
  });
});








// Start server
app.listen(5000, () => console.log('Server running on port 5000')).on('error', (err) => {
  console.error('Error starting server:', err);
});

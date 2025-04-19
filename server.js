const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');

const app = express();
const port = 5000;

// Middleware
// app.use(cors({
//   origin: ['http://localhost:3000', 'http://192.168.x.x:3000'], // Update with your network IP
// }));
// app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/appfinity', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Submission Schema
const submissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: String,
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Submission = mongoose.model('Submission', submissionSchema);

// POST /api/contact - Submit form
app.post(
  '/api/contact',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('subject').trim().optional(),
  ],
  async (req, res) => {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, subject, message } = req.body;

    try {
      const submission = new Submission({ name, email, subject, message });
      await submission.save();
      res.status(201).json({ message: 'Form submitted successfully', submission });
    } catch (err) {
      console.error('Error saving submission:', err);
      res.status(500).json({ error: 'Failed to save submission' });
    }
  }
);

// GET /api/contact - Retrieve all submissions (for testing/admin)
app.get('/api/contact', async (req, res) => {
  try {
    const submissions = await Submission.find().sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    console.error('Error retrieving submissions:', err);
    res.status(500).json({ error: 'Failed to retrieve submissions' });
  }
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});

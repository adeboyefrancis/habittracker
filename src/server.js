// server.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// In-memory storage (for learning purposes)
let habits = [
  { id: 1, name: 'Exercise', streak: 5, lastCompleted: null },
  { id: 2, name: 'Read', streak: 3, lastCompleted: null },
  { id: 3, name: 'Meditate', streak: 0, lastCompleted: null }
];

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.get('/api/habits', (req, res) => {
  res.json(habits);
});

app.post('/api/habits', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Habit name is required' });
  }
  
  const newHabit = {
    id: habits.length > 0 ? Math.max(...habits.map(h => h.id)) + 1 : 1,
    name,
    streak: 0,
    lastCompleted: null
  };
  
  habits.push(newHabit);
  res.status(201).json(newHabit);
});

app.post('/api/habits/:id/complete', (req, res) => {
  const habit = habits.find(h => h.id === parseInt(req.params.id));
  if (!habit) {
    return res.status(404).json({ error: 'Habit not found' });
  }
  
  const today = new Date().toDateString();
  if (habit.lastCompleted === today) {
    return res.status(400).json({ error: 'Habit already completed today' });
  }
  
  habit.streak++;
  habit.lastCompleted = today;
  res.json(habit);
});

app.delete('/api/habits/:id', (req, res) => {
  const index = habits.findIndex(h => h.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Habit not found' });
  }
  
  habits.splice(index, 1);
  res.status(204).send();
});

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Habit Tracker running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
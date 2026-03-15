const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// apply auth middleware to all routes
router.use(authMiddleware);

// GET all tasks
router.get('/', async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM tasks WHERE user_id = $1',
    [req.user.userId]
  );
  res.json(result.rows);
});

// CREATE task
router.post('/', async (req, res) => {
  const { title } = req.body;

  const result = await pool.query(
    'INSERT INTO tasks (title, user_id) VALUES ($1,$2) RETURNING *',
    [title, req.user.userId]
  );

  res.json(result.rows[0]);
});

// DELETE task
router.delete('/:id', async (req, res) => {
  await pool.query(
    'DELETE FROM tasks WHERE id=$1 AND user_id=$2',
    [req.params.id, req.user.userId]
  );

  res.json({ message: 'Deleted' });
});

module.exports = router;
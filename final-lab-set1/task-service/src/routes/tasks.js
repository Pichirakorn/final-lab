const express = require('express');
const router = express.Router();
const { pool } = require('../db/db');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// GET all tasks
router.get('/', async (req, res) => {

  const result = await pool.query(
    'SELECT * FROM tasks WHERE user_id = $1',
    [req.user.sub]
  );

  res.json(result.rows);

});

// GET task by id
router.get('/:id', async (req, res) => {

  const result = await pool.query(
    'SELECT * FROM tasks WHERE id=$1 AND user_id=$2',
    [req.params.id, req.user.sub]
  );

  res.json(result.rows[0]);

});

// CREATE task
router.post('/', async (req, res) => {

  const { title } = req.body;

  const result = await pool.query(
    'INSERT INTO tasks (title, user_id) VALUES ($1,$2) RETURNING *',
    [title, req.user.sub]
  );

  res.json(result.rows[0]);

});

// UPDATE task
router.put('/:id', async (req, res) => {

  const { title } = req.body;

  try {

    await pool.query(
      'UPDATE tasks SET title=$1 WHERE id=$2 AND user_id=$3',
      [title, req.params.id, req.user.sub]
    );

    res.json({ message: "Task updated" });

  } catch (err) {

    console.error(err);
    res.status(500).json({ error: "Database error" });

  }

});
// DELETE task
router.delete('/:id', async (req, res) => {

  await pool.query(
    'DELETE FROM tasks WHERE id=$1 AND user_id=$2',
    [req.params.id, req.user.sub]
  );

  res.json({ message: 'Deleted' });

});

module.exports = router;
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categories');

router.get('/', getAllCategories); // Public
router.post('/', authMiddleware, createCategory);
router.put('/:id', authMiddleware, updateCategory);
router.delete('/:id', authMiddleware, deleteCategory);

module.exports = router;

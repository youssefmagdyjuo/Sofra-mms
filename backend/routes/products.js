const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  importProducts,
  exportProducts,
} = require('../controllers/products');

router.get('/', getAllProducts); // Public
router.get('/export', authMiddleware, exportProducts);
router.post('/import', authMiddleware, upload.single('file'), importProducts);
router.post('/', authMiddleware, createProduct);
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

module.exports = router;

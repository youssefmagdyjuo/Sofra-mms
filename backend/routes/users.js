const express = require('express');
const router = express.Router();
const { requireAuth, requireSuperAdmin } = require('../middleware/auth');
const {
  getAllUsers,
  createUser,
  deleteUser
} = require('../controllers/users');

// Protect all routes with auth and super admin checks
router.use(requireAuth);
router.use(requireSuperAdmin);

// Standard and customized endpoints
router.get('/', getAllUsers);
router.post('/', createUser);
router.post('/create', createUser);
router.delete('/:id', deleteUser);
router.delete('/delete/:id', deleteUser);

module.exports = router;

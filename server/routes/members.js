const express = require('express');
const router = express.Router();
const {
  getMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
  getMemberStats
} = require('../controllers/memberController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);

router.get('/stats', getMemberStats);
router.get('/', getMembers);
router.get('/:id', getMember);
router.post('/', authorize('admin', 'leader'), createMember);
router.put('/:id', authorize('admin', 'leader'), updateMember);
router.delete('/:id', authorize('admin'), deleteMember);

module.exports = router;

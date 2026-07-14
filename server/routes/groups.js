const express = require('express');
const router = express.Router();
const {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  addMemberToGroup,
  removeMemberFromGroup
} = require('../controllers/groupController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);

router.get('/', getGroups);
router.get('/:id', getGroup);
router.post('/', authorize('admin', 'leader'), createGroup);
router.put('/:id', authorize('admin', 'leader'), updateGroup);
router.delete('/:id', authorize('admin'), deleteGroup);
router.post('/:id/members', authorize('admin', 'leader'), addMemberToGroup);
router.delete('/:id/members/:memberId', authorize('admin', 'leader'), removeMemberFromGroup);

module.exports = router;

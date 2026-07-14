const express = require('express');
const router = express.Router();
const {
  getContent,
  getContentItem,
  createContent,
  updateContent,
  deleteContent
} = require('../controllers/contentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);

router.get('/', getContent);
router.get('/:id', getContentItem);
router.post('/', authorize('admin', 'leader'), createContent);
router.put('/:id', authorize('admin', 'leader'), updateContent);
router.delete('/:id', authorize('admin'), deleteContent);

module.exports = router;

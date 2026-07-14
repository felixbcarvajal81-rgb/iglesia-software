const express = require('express');
const router = express.Router();
const {
  getContributions,
  getContribution,
  createContribution,
  updateContribution,
  deleteContribution,
  getContributionStats
} = require('../controllers/contributionController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);

router.get('/stats', getContributionStats);
router.get('/', getContributions);
router.get('/:id', getContribution);
router.post('/', authorize('admin', 'leader'), createContribution);
router.put('/:id', authorize('admin'), updateContribution);
router.delete('/:id', authorize('admin'), deleteContribution);

module.exports = router;

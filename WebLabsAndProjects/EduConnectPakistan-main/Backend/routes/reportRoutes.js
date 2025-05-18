// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const {
  getPopularSubjects,
  getCompletionRates,
  getUsageByCity,
  getUserGrowth,
  getAllReports
} = require('../controllers/reportController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);
router.use(restrictTo('admin'));

router.get('/subjects', getPopularSubjects);
router.get('/completion', getCompletionRates);
router.get('/cities', getUsageByCity);
router.get('/growth', getUserGrowth);
router.get('/', getAllReports);

module.exports = router;
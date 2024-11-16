const express = require('express');
const { getAssignments, acceptAssignment, rejectAssignment } = require('../controllers/adminController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(authMiddleware);
router.get('/assignments', getAssignments);
router.post('/assignments/:id/accept', acceptAssignment);
router.post('/assignments/:id/reject', rejectAssignment);

module.exports = router;
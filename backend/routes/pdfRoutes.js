const express = require('express');
const router = express.Router();
const { upload, uploadPDF } = require('../controllers/pdfController');
const { protect } = require('../middleware/authMiddleware');

router.post('/upload', protect, upload.single('pdf'), uploadPDF);

module.exports = router;
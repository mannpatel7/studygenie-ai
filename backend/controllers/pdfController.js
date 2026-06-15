const multer = require('multer');
const pdfParse = require('pdf-parse');

// Configure multer for in-memory file upload compatible with serverless environments
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// @desc    Upload PDF and extract text
// @route   POST /api/pdf/upload
// @access  Private
const uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const dataBuffer = req.file.buffer;
    if (!Buffer.isBuffer(dataBuffer)) {
      return res.status(400).json({ message: 'Uploaded PDF payload is invalid' });
    }

    const data = await pdfParse(dataBuffer);

    res.status(200).json({
      filename: req.file.originalname,
      text: data.text || '',
      pages: data.numpages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to process PDF' });
  }
};

module.exports = {
  upload,
  uploadPDF,
};
const path = require('path');

// Upload single image
const uploadSingle = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Cloudinary automatically uploads and returns the URL
    const filePath = req.file.path; // This is the Cloudinary URL
    
    res.json({
      message: 'File uploaded successfully',
      filePath: filePath, // Full Cloudinary URL (e.g., https://res.cloudinary.com/...)
      fileName: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Error uploading file' });
  }
};

// Upload multiple images
const uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const filePaths = req.files.map(file => ({
      filePath: file.path, // Cloudinary URL
      fileName: file.filename,
      originalName: file.originalname,
      size: file.size
    }));
    
    res.json({
      message: 'Files uploaded successfully',
      files: filePaths
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Error uploading files' });
  }
};

module.exports = { uploadSingle, uploadMultiple };

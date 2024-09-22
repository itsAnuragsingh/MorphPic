// server.js
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use(cors());
app.use(express.json());


app.get('/',(req, res) => {
  res.send('API working.....');
})

// Upload file to Cloudinary
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    fs.unlinkSync(req.file.path); // Delete local file after upload
    res.json({ filename: result.public_id });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Convert file
app.post('/api/convert', async (req, res) => {
  const { filename, format } = req.body;
  try {
    const inputBuffer = await downloadFromCloudinary(filename);
    const outputBuffer = await convertImage(inputBuffer, format);
    const result = await uploadToCloudinary(outputBuffer, format);
    res.json({ convertedFilename: result.public_id });
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: 'Conversion failed' });
  }
});

// Download converted file
app.get('/api/download/:filename', async (req, res) => {
  const { filename } = req.params;
  try {
    const result = await cloudinary.api.resource(filename);
    res.redirect(result.secure_url);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

// Delete files after successful download
app.post('/api/delete', async (req, res) => {
  const { originalFilename, convertedFilename } = req.body;
  try {
    await cloudinary.uploader.destroy(originalFilename);
    await cloudinary.uploader.destroy(convertedFilename);
    res.json({ message: 'Files deleted successfully' });
  } catch (error) {
    console.error('Deletion error:', error);
    res.status(500).json({ error: 'Deletion failed' });
  }
});

// Helper functions
async function downloadFromCloudinary(publicId) {
  const result = await cloudinary.api.resource(publicId);
  const response = await fetch(result.secure_url);
  return response.arrayBuffer();
}

async function convertImage(inputBuffer, format) {
  const sharpInstance = sharp(Buffer.from(inputBuffer));
  
  switch (format.toLowerCase()) {
    case 'jpeg':
    case 'jpg':
      return sharpInstance.jpeg().toBuffer();
    case 'png':
      return sharpInstance.png().toBuffer();
    case 'webp':
      return sharpInstance.webp().toBuffer();
    case 'tiff':
      return sharpInstance.tiff().toBuffer();
    case 'avif':
      return sharpInstance.avif().toBuffer();
    default:
      throw new Error('Unsupported format');
  }
}

async function uploadToCloudinary(buffer, format) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'image', format: format },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
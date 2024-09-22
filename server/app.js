const express = require('express');
const multer = require('multer');
const { put, del, list } = require('@vercel/blob');
const sharp = require('sharp');
const cors = require('cors');
require('dotenv').config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API working.....');
});

// Upload file to Vercel Blob Store
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const { url } = await put(req.file.originalname, req.file.buffer, { access: 'public' });
    res.json({ filename: url });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Convert file
app.post('/api/convert', async (req, res) => {
  const { filename, format } = req.body;
  try {
    const inputBuffer = await downloadFromBlobStore(filename);
    const outputBuffer = await convertImage(inputBuffer, format);
    const { url } = await put(`converted_${Date.now()}.${format}`, outputBuffer, { access: 'public' });
    res.json({ convertedFilename: url });
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: 'Conversion failed' });
  }
});

// Download converted file
app.get('/api/download/:filename', async (req, res) => {
  const { filename } = req.params;
  try {
    const file = await downloadFromBlobStore(filename);
    const contentType = getContentTypeFromFilename(filename);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(file));
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

function getContentTypeFromFilename(filename) {
  const extension = filename.split('.').pop().toLowerCase();
  const contentTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'tiff': 'image/tiff',
    'avif': 'image/avif'
  };
  return contentTypes[extension] || 'application/octet-stream';
}

// Delete files after successful download
app.post('/api/delete', async (req, res) => {
  const { originalFilename, convertedFilename } = req.body;
  try {
    await del(originalFilename);
    await del(convertedFilename);
    res.json({ message: 'Files deleted successfully' });
  } catch (error) {
    console.error('Deletion error:', error);
    res.status(500).json({ error: 'Deletion failed' });
  }
});

// Helper functions
async function downloadFromBlobStore(url) {
  const response = await fetch(url);
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

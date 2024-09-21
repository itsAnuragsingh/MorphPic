const path = require('path');
const conversionService = require('../services/conversionService');
const { cleanupFiles } = require('../utils/fileCleanup');

exports.uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.status(200).json({ filename: req.file.filename });
};

exports.convertFile = async (req, res) => {
  const { filename, outputFormat } = req.body;
  try {
    const convertedFilename = await conversionService.convertFile(filename, outputFormat);
    res.status(200).json({ convertedFilename });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.downloadFile = (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../converted', filename);
  res.download(filePath, (err) => {
    if (err) {
      res.status(500).send('Error downloading file');
    } else {
      cleanupFiles(path.join(__dirname, '../uploads'));
      cleanupFiles(path.join(__dirname, '../converted'));
    }
  });
};
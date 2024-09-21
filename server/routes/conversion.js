const express = require('express');
const router = express.Router();
const conversionController = require('../controllers/conversionController');
const upload = require('../middleware/upload');

router.post('/upload', upload.single('file'), conversionController.uploadFile);
router.post('/convert', conversionController.convertFile);
router.get('/download/:filename', conversionController.downloadFile);

module.exports = router;
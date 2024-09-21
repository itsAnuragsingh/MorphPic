const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const supportedFormats = ['jpeg', 'png', 'webp', 'tiff', 'avif'];

const convertImage = async (inputPath, outputPath, format) => {
  const image = sharp(inputPath);
  
  switch (format.toLowerCase()) {
    case 'jpeg':
    case 'jpg':
      await image.jpeg().toFile(outputPath);
      break;
    case 'png':
      await image.png().toFile(outputPath);
      break;
    case 'webp':
      await image.webp().toFile(outputPath);
      break;
    case 'tiff':
      await image.tiff().toFile(outputPath);
      break;
    case 'avif':
      await image.avif().toFile(outputPath);
      break;
    default:
      throw new Error(`Unsupported output format: ${format}`);
  }
};

exports.convertFile = async (filename, outputFormat) => {
  const inputPath = path.join(__dirname, '../uploads', filename);
  const outputFilename = `${path.parse(filename).name}.${outputFormat.toLowerCase()}`;
  const outputPath = path.join(__dirname, '../converted', outputFilename);

  const inputFormat = path.extname(filename).toLowerCase().slice(1);
  
  if (!supportedFormats.includes(inputFormat) || !supportedFormats.includes(outputFormat.toLowerCase())) {
    throw new Error('Unsupported conversion');
  }

  await convertImage(inputPath, outputPath, outputFormat);

  return outputFilename;
};
const fs = require('fs').promises;
const path = require('path');

const cleanupFiles = async (directory) => {
  const files = await fs.readdir(directory);
  for (const file of files) {
    await fs.unlink(path.join(directory, file));
  }
};

module.exports = { cleanupFiles };
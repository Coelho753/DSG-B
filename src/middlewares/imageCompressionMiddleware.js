const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const compressUploadedImages = async (req, res, next) => {
  try {
    if (!req.files?.length) return next();

    const compressedFiles = [];
    for (const file of req.files) {
      const compressedName = `${path.parse(file.filename).name}-compressed.jpg`;
      const compressedPath = path.join(path.dirname(file.path), compressedName);

      await sharp(file.path)
        .rotate()
        .resize({ width: 1600, withoutEnlargement: true })
        .jpeg({ quality: 80, mozjpeg: true })
        .toFile(compressedPath);

      fs.unlinkSync(file.path);

      compressedFiles.push({
        ...file,
        filename: compressedName,
        path: compressedPath,
        mimetype: 'image/jpeg',
      });
    }

    req.files = compressedFiles;
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = compressUploadedImages;

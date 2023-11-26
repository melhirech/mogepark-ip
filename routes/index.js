var express = require('express');
var router = express.Router();
const path = require('path')
const sharp = require('sharp')
const tinycolor = require("tinycolor2");
const archiver = require("archiver");

const imagesPath = path.join(__dirname, '../public/images/')
const overlayLightPath = imagesPath + 'textOverlayLight.png'
const overlayDarkPath = imagesPath + 'textOverlayDark.png'

var fs = require('fs');
var outputDir = imagesPath + 'output'
const archiveFilePath = imagesPath + 'processed.zip'

if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir);
}

const processImage = (imageInput, folder) => new Promise(async (resolve, reject) => {
  const { src, height, width, center = true } = imageInput
    const uri = src.split(';base64,').pop()
    const imgBuffer = Buffer.from(uri, 'base64');
  
    const metadata = await sharp(imgBuffer).metadata();
    const { dominant } = await sharp(imgBuffer).stats();
    const { r, g, b } = dominant;
    const color = tinycolor({ r, g, b });

    const BOTTOM_LEFT = { left: 10, top: metadata.height - 40  }
    const overlayText = color.isLight() ? overlayDarkPath : overlayLightPath 

    const leftLayer = { input: overlayText, ...BOTTOM_LEFT }
    const centerLayer = { input: overlayText, gravity: 'centre' }

    const compositeImage = sharp(imgBuffer)
    .composite([ center ? centerLayer : leftLayer])

    const processedImage = await compositeImage.toBuffer()

    await compositeImage.toFile(imagesPath + 'output/' + Date.now() + '.png')
  
    const imageToBase64 = `data:image/png;base64,${processedImage.toString('base64')}`
    resolve({ src: imageToBase64, height, width })
});

const archiveImages = () => {

  const archive = archiver('zip', { zlib: { level: 9 }});
  const stream = fs.createWriteStream(archiveFilePath);

  return new Promise((resolve, reject) => {
    archive
      .directory(outputDir, false)
      .on('error', err => reject(err))
      .pipe(stream)
    ;

    stream.on('close', () => resolve());
    archive.finalize();
  });
}

/* GET home page. */
router.get('/', async function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/process', async (req, res) => {
  const {images, folder = 'output'} = req.body

  fs.readdir(outputDir, (err, files) => {
    if (err) throw err;
  
    for (const file of files) {
      fs.unlink(path.join(outputDir, file), (err) => {
        if (err) throw err;
      });
    }
  });

  const processedImages = await Promise.all(images.map(img => processImage(img, folder)))
  
  res.json(processedImages)
})

router.get('/download', async (req, res) => {
  await archiveImages()
  
  var stat = fs.statSync(archiveFilePath);

  res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Length': stat.size
  });
  
  var readStream = fs.createReadStream(archiveFilePath);
  // We replaced all the event handlers with a simple call to readStream.pipe()
  readStream.pipe(res);
})

module.exports = router;

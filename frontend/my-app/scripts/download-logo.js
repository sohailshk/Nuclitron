const fs = require('fs');
const https = require('https');
const path = require('path');

const logoUrl = 'https://www.incois.gov.in/images/logo.png';
const outputDir = path.join(__dirname, '..', 'public', 'images');
const outputPath = path.join(outputDir, 'incois-logo.png');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const file = fs.createWriteStream(outputPath);

https.get(logoUrl, (response) => {
  response.pipe(file);
  
  file.on('finish', () => {
    file.close();
    console.log('INCOIS logo downloaded successfully');
  });}).on('error', (err) => {
  fs.unlink(outputPath, () => {});
  console.error('Error downloading INCOIS logo:', err.message);
});

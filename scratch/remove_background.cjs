const fs = require('fs');
const path = require('path');

// Tự động tải pngjs bằng npx nếu chưa có
try {
  const PNG = require('pngjs').PNG;
  processImage(PNG);
} catch (e) {
  console.log('pngjs not found, installing...');
  const { execSync } = require('child_process');
  execSync('npm install pngjs', { cwd: __dirname });
  const PNG = require('pngjs').PNG;
  processImage(PNG);
}

function processImage(PNG) {
  const inputPath = path.join(__dirname, '../public/vna-images/vna_logo_white.png');
  const outputPath = path.join(__dirname, '../public/vna-images/vna_logo_transparent.png');

  fs.createReadStream(inputPath)
    .pipe(new PNG())
    .on('parsed', function () {
      let transparentPixels = 0;
      let totalPixels = this.width * this.height;

      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const idx = (this.width * y + x) << 2;

          const r = this.data[idx];
          const g = this.data[idx + 1];
          const b = this.data[idx + 2];
          const a = this.data[idx + 3];

          // Màu nền xanh của Vietnam Airlines (R khoảng dưới 20, G khoảng 70-110, B khoảng 80-130)
          // Hoặc bất kỳ pixel nào KHÔNG PHẢI MÀU TRẮNG (R, G, B đều lớn hơn 200) thì ta biến thành trong suốt.
          // Vì logo chữ và hoa sen có màu trắng hoàn toàn.
          const isWhite = r > 210 && g > 210 && b > 210;

          if (!isWhite) {
            this.data[idx + 3] = 0; // Đặt opacity (Alpha) bằng 0
            transparentPixels++;
          }
        }
      }

      console.log(`Processed ${totalPixels} pixels. Made ${transparentPixels} pixels transparent.`);

      this.pack().pipe(fs.createWriteStream(outputPath))
        .on('finish', () => {
          console.log('Finished saving transparent logo to:', outputPath);
        });
    });
}

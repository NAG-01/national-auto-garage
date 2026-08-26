import fs from 'fs';
import path from 'path';

const imgPath = 'C:/Users/91816/.gemini/antigravity/brain/63c8a2e2-97ce-4b17-b43b-b3af830750a7/.user_uploaded/media_1787735043536.jpg';

if (fs.existsSync(imgPath)) {
  const b64 = fs.readFileSync(imgPath).toString('base64');
  const targetDir = path.resolve('frontend/src/assets');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const fileContent = `export const logoBase64 = "data:image/jpeg;base64,${b64}";\n`;
  fs.writeFileSync(path.join(targetDir, 'logoData.js'), fileContent);
  console.log('Successfully saved logoBase64 to frontend/src/assets/logoData.js. Length:', b64.length);
} else {
  console.error('Image file not found:', imgPath);
}

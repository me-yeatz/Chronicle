import fs from 'fs';
import path from 'path';
import pngToIco from 'png-to-ico';

const src = path.resolve('assets/chronicle.png');
const dest = path.resolve('assets/icon.ico');

pngToIco(src)
  .then(buf => fs.writeFileSync(dest, buf))
  .catch(err => {
    console.error('ICO generation failed:', err);
    process.exit(1);
  });

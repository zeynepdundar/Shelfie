import postcss from 'postcss';
import tw from '@tailwindcss/postcss';
import fs from 'fs';
const css = fs.readFileSync('app/globals.css','utf8');
const res = await postcss([tw({ base: process.cwd() })]).process(css, { from: 'app/globals.css' });
fs.writeFileSync('/tmp/out.css', res.css);
console.log('OK bytes=', res.css.length);

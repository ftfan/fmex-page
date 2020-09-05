const fs = require('fs');
const path = require('path');

// 目录获取
const dir = path.join(__dirname, 'docs');

// 获取html文件
const FileStr = fs.readFileSync(path.join(dir, 'index.html'), 'utf-8');

const result = FileStr.replace(/__Build_Time__/, Date.now());
fs.writeFile(path.join(dir, 'index.html'), result, (err) => {
  if (err) throw err;
});

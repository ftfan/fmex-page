const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const OSS = require('ali-oss');

const PublishTime = Date.now();

// 目录获取
const dir = path.join(__dirname, 'dist');
const uploadList = [];

// 获取html文件
const FileStr = fs.readFileSync(path.join(dir, 'index.html'), 'utf-8');

// 设置 HTML 的发布时间
const result = FileStr.replace(/__Build_Time__/, PublishTime).replace(/__FMexFun_Version__/, PublishTime);
fs.writeFileSync(path.join(dir, 'index.html'), result);

fs.writeFileSync(path.join(dir, 'version.js'), `if (window.__FMexFun_Version > ${PublishTime}) location.reload();`);

const AppConfig = {
  AliOss: {
    region: '<oss region>',
    accessKeyId: '<Your accessKeyId>',
    accessKeySecret: '<Your accessKeySecret>',
    bucket: '<Your bucket name>',
  },
  // CacheControl: 'max-age=315360000000',
};

try {
  const UserConf = require('./my.config.js');
  Object.assign(AppConfig, UserConf);
} catch (e) {
  //
}

function ForEachDist(dir) {
  const arr = fs.readdirSync(dir);
  arr.forEach((item) => {
    const fullpath = path.join(dir, item);
    const fullpath2 = fullpath.replace('\\dist\\', '\\docs\\');
    const stats = fs.statSync(fullpath);
    if (stats.isDirectory()) {
      if (!fs.existsSync(fullpath2)) fs.mkdirSync(fullpath2);
      ForEachDist(fullpath);
    } else {
      TryUploadFile(fullpath, fullpath2, stats);
    }
  });
}

ForEachDist(path.join(__dirname, 'dist'));
const Handler = new OSS(AppConfig.AliOss);
Handler.useBucket(AppConfig.AliOss.bucket);
doUpload();

function TryUploadFile(fullpath, fullpath2, stats) {
  // 文件不存在
  if (!fs.existsSync(fullpath2)) return UploadFile(fullpath, fullpath2);
  const stats2 = fs.statSync(fullpath2);
  if (stats2.size !== stats.size) return UploadFile(fullpath, fullpath2);

  // 读取一个Buffer
  const buffer = fs.readFileSync(fullpath);
  const buffer2 = fs.readFileSync(fullpath2);
  const fsHash = crypto.createHash('md5');
  const fsHash2 = crypto.createHash('md5');
  fsHash.update(buffer);
  fsHash2.update(buffer2);
  const md5 = fsHash.digest('hex');
  const md52 = fsHash2.digest('hex');
  if (md5 !== md52) return UploadFile(fullpath, fullpath2);
  // console.log('[相同文件]', fullpath);
}

function UploadFile(fullpath, fullpath2) {
  console.log('-->', fullpath);
  const readStream = fs.createReadStream(fullpath);
  const writeStream = fs.createWriteStream(fullpath2);
  readStream.pipe(writeStream);
  // const ossurl = fullpath.replace(/(.*?)\\dist\\/, 'docs\\');
  // 等待上传队列
  uploadList.push(fullpath);
}

async function doUpload() {
  const uploadLists = uploadList.map((fullpath) => [fullpath.replace(/(.*?)\\dist\\/, '').replace(/\\/g, '/'), fs.createReadStream(fullpath)]);
  // 找出需要延后上传的
  const lastUpload = uploadLists.filter((item) => ['index.html', 'version.js'].indexOf(item[0]) > -1);
  const perUpload = uploadLists.filter((item) => lastUpload.indexOf(item) === -1);
  // console.log(perUpload.map(i => i[0]));
  await Promise.all(
    perUpload.map((item) => {
      console.log('--<', item[0]);
      return Handler.putStream(item[0], item[1], {
        headers: {
          'Cache-Control': 'max-age=6048000000', // 70天
        },
      });
    })
  );
  await Promise.all(
    lastUpload.map((item) => {
      console.log('--<', item[0]);
      return Handler.putStream(item[0], item[1], {
        headers: {
          'Cache-Control': 'max-age=360000', // 6分钟
        },
      });
    })
  );
}

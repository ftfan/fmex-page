export const sleep = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time || 20);
  });
};

export const IdCreate = () => {
  return (
    getTimeId().toString(36) +
    Math.random()
      .toString(36)
      .replace('0.', '')
  );
};

// 保证内存内，该数值是唯一ID
const timeIds: any = {};
export const getTimeId = (time = Date.now()): number => {
  if (timeIds[time]) return getTimeId(time + 1);
  timeIds[time] = true;
  return time;
};

export function clone<T>(data: T) {
  return JSON.parse(JSON.stringify(data)) as T;
}

export function isPromise(obj: any): obj is Promise<any> {
  return obj instanceof Promise || (obj && typeof obj.then === 'function');
}

export const DateFormat = (time: number | Date, fmt = 'yyyy-MM-dd hh:mm:ss') => {
  time = new Date(time);

  const o: { [index: string]: number } = {
    'M+': time.getMonth() + 1, // 月份
    'd+': time.getDate(), // 日
    'h+': time.getHours(), // 小时
    'H+': time.getHours(), // 小时
    'm+': time.getMinutes(), // 分
    's+': time.getSeconds(), // 秒
    'q+': Math.floor((time.getMonth() + 3) / 3), // 季度
    S: time.getMilliseconds(), // 毫秒
  };
  const week = ['\u65e5', '\u4e00', '\u4e8c', '\u4e09', '\u56db', '\u4e94', '\u516d'];

  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (time.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  if (/(E+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length > 1 ? (RegExp.$1.length > 2 ? '\u661f\u671f' : '\u5468') : '') + week[time.getDay()]);
  }
  for (const k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? String(o[k]) : ('00' + o[k]).substr(('' + o[k]).length));
    }
  }
  return fmt;
};

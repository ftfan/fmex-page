import URIJS from 'urijs';

export { URIJS };

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

export const BigNumShowStr = (num: number) => {
  if (num < 10000) return num.toString();
  if (num < 10000) return Math.floor(num / 100) / 100 + '万';
  if (num < 100000) return Math.floor(num / 1000) / 10 + '万';
  if (num < 1000000) return Math.floor(num / 10000) + '万';
  if (num < 100000000) return Math.floor(num / 1000000) / 100 + '亿';
  if (num < 1000000000) return Math.floor(num / 10000000) / 10 + '亿';
  return Math.floor(num / 100000000) + '亿';
};

// echarts 的工具开放
export const EchartsUtilsToolbox = {
  show: true,
  feature: {
    dataZoom: {
      yAxisIndex: 'none',
    },
    dataView: { readOnly: false },
    magicType: { type: ['line', 'bar'] },
    restore: {},
    saveAsImage: {},
  },
};

// 对数组进行数据采样
export const ArrayFilter = (arr: any[], num: number) => {
  if (!arr.length) return;
  const diffOut = arr.length / num; // 每隔 这么多个，留下一个
  if (diffOut <= 1) return;
  let ii = 0;
  const map: any = {};
  arr.forEach((i, index) => {
    map[Math.floor(index * diffOut)] = true;
    // 无需修改的有效数据
    if (map[index]) {
      arr[ii++] = i;
      return;
    }
  });

  const last = arr[arr.length - 1];
  arr.splice(ii, arr.length - ii);
  arr[arr.length - 1] = last; // 一定把最后一条数据放进去，有头有尾
};

const ua = window.navigator.userAgent.toLowerCase();
export const IsWechat = ua.indexOf('micromessenger') !== -1;

export function IsPC() {
  const userAgentInfo = navigator.userAgent;
  const Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod'];
  let flag = true;
  for (let v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > -1) {
      flag = false;
      break;
    }
  }
  return flag;
}

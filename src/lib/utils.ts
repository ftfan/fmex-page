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

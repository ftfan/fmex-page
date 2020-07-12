import { isPromise } from './utils';

/**
 * 方法开始时设置loading，结束设置false
 * @param key 关联的属性 key 值
 * @param choke 是否阻塞（后续相关方法唤起时，key 为 true 则 直接 抛异常 ）
 */
export function Loading(key = 'loading', choke = true): import('vue-class-component').VueDecorator {
  return function(_target: any, propertyKey: string, descriptor: any) {
    const original = descriptor.value;
    descriptor.value = function emitter(this: any, ...args: any[]) {
      if (choke && this[key]) throw new Error(`${key} true`);
      const end = () => {
        this[key] = false;
      };
      this[key] = true;
      const returnValue: any = original.apply(this, args);

      if (isPromise(returnValue)) {
        returnValue.finally(end);
      } else {
        end();
      }
      return returnValue;
    };
  } as any;
}

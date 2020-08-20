export enum Code {
  Success = 0,
  FCoinApiKeyNotFount = 2020, // API key无效
  FCoinIllegalAPIsignature = 2111, // 无效的API签名
  FCoinTimeoutRange = 6004, // 时间超出范围
  FCoinApiScopeNotSupport = 3001, // 权限范围超出
  FCoinOrderNotFount = 1797, // 订单未发现
  Error = 500,
  NetError = 10001,
}

export function isCodeObj(data: any): data is CodeObj<any> {
  if (!data) return false;
  if (typeof data !== 'object') return false;
  if (!('Code' in data)) return false;
  return true;
}

export class CodeObj<T> {
  Code!: Code;
  Data!: T;
  Msg!: string;
  Ts!: number;
  FCoinErr!: null | {
    status: number;
    msg: string;
  };

  constructor(arg: Code | Partial<CodeObj<T>>, data?: T, msg?: string, FCoinErr?: any) {
    this.Msg = '';
    this.Ts = Date.now();
    if (typeof arg !== 'object') {
      this.Code = arg;
      if (data) this.Data = data;
      if (msg) this.Msg = msg;
      if (FCoinErr) {
        this.FCoinErr = {
          status: FCoinErr.status,
          msg: FCoinErr.msg,
        };
      }
      this.Msg = this.Msg || '出错了';
      return;
    }

    if ('Code' in arg) {
      this.Code = arg.Code!;
    } else {
      this.Code = Code.Success;
    }
    if ('Data' in arg) {
      this.Data = arg.Data!;
    } else {
      this.Data = null as any;
    }
    if ('Msg' in arg) {
      this.Msg = arg.Msg!;
    } else {
      this.Msg = '';
    }
    if ('FCoinErr' in arg && arg.FCoinErr) {
      this.FCoinErr = {
        status: arg.FCoinErr.status,
        msg: arg.FCoinErr.msg,
      };
    }
    this.Msg = this.Msg || '出错了';
  }

  Error() {
    const res = this.Code !== Code.Success;
    return res;
  }

  Success() {
    return !this.Error();
  }

  Query() {
    return {
      Code: String(this.Code),
      Msg: String(this.Msg),
      Ts: String(this.Ts),
    };
  }

  toString() {
    return JSON.stringify({
      Code: this.Code,
      Msg: this.Msg,
      Ts: this.Ts,
      FCoinErr: this.FCoinErr || undefined,
    });
  }

  valueOf() {
    return this.toString();
  }
}

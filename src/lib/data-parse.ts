const DataParseFun: any = {
  parse1(data: any, params: any) {
    return data.map((item: any) => {
      const revert: any = {};
      item.forEach((val: any, index: any) => {
        const p = params[index];
        if (p.Add) val = val + p.Add;
        revert[p.Key] = val;
      });
      return revert;
    });
  },
};

export const DataParse = (data: any) => {
  if (!data) return data;
  if (!data.DataParse) return data;
  const fun = DataParseFun[data.DataParse];
  if (!fun) return data;
  return fun(data.Data, data.Params);
};

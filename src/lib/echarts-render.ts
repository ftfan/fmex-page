import echarts from 'echarts';

export const EchartsBar = (el: HTMLDivElement, option: echarts.EChartOption) => {
  const myChart = echarts.init(el);
  myChart.setOption(option);
};

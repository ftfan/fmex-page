class LoadingClose {
  text = '';
  constructor(text = '') {
    this.text = text;
  }
}

const el = document.getElementById('page-loader-model')!;
const text = document.getElementById('page-loader-model-text')!;
const data: LoadingClose[] = [];

export const PageLoading = (text = '') => {
  const close = new LoadingClose(text);
  DataPush(close);
  return () => DataPop(close);
};

function DataPush(close: LoadingClose) {
  data.push(close);
  CheckData();
}

function DataPop(close: LoadingClose) {
  data.splice(data.indexOf(close), 1);
  CheckData();
}

function CheckData() {
  if (data.length === 0) {
    el.className = 'hide';
  } else {
    el.className = '';
    text.innerHTML = data[data.length - 1].text;
  }
}

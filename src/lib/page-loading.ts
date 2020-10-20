class LoadingClose {
  text = '';
  constructor(text = '') {
    this.text = text;
  }
}

const el = document.getElementById('page-loader-model');
const text = document.getElementById('page-loader-model-text');
const data: LoadingClose[] = [];

export const PageLoading = (text = '') => {
  const close = new LoadingClose(text);
  DataPush(close);
  const timer = setTimeout(() => DataPop(close), 5000);
  return () => {
    clearTimeout(timer);
    DataPop(close);
  };
};

function DataPush(close: LoadingClose) {
  data.push(close);
  CheckData();
}

function DataPop(close: LoadingClose) {
  const index = data.indexOf(close);
  if (index === -1) return;
  data.splice(index, 1);
  CheckData();
}

function CheckData() {
  if (!el) return;
  if (!text) return;
  if (data.length === 0) {
    el.className = 'hide';
  } else {
    el.className = '';
    text.innerHTML = data[data.length - 1].text;
  }
}

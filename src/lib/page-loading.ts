class LoadingClose {}

const el = document.getElementById('page-loader-model')!;
const data: LoadingClose[] = [];

export const PageLoading = () => {
  const close = new LoadingClose();
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
  }
}

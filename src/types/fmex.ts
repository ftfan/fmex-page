import BigNumber from 'bignumber.js';

export interface SnapshotItem {
  amount: number;
  hash: string;
  id: string;
  label: string;
}
export interface Snapshot {
  current_elements: number;
  has_next: boolean;
  has_prev: boolean;
  next_page_id: string;
  content: SnapshotItem[];
}

export interface platform_wallet_assets {
  address: string;
  amount: BigNumber; // "33.77548155",
  address_label: string; // "Hot wallet collection address",
  explorer_url: string; // "https://btc.com/1FXXK9hcWt2aEFvdbraaH6gJR2Wsa8TWdT"
}

// 钱包资产备份模型
export interface SnapshotWallet {
  snapshot_time: number;
  snapshot_file: number;
  platform_total_amount: BigNumber; // "388.99630728",
  user_total_amount: BigNumber; // "345.74011921",
  assets_rate: BigNumber; // "1.12",
  platform_wallet_assets: platform_wallet_assets[];
  confirm_state: number;
}

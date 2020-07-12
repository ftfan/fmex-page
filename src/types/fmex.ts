export interface SnapshotItem {
  amount: number;
  hash: number;
  id: number;
}
export interface Snapshot {
  current_elements: number;
  has_next: boolean;
  has_prev: boolean;
  next_page_id: string;
  content: SnapshotItem[];
}

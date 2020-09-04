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

export interface RetrievedChunk {
  chunk_id?: string;
  source: string;
  content: string;
  dense_score?: number;
  sparse_score?: number;
  combined_score: number;
  metadata?: Record<string, any>;
}

export interface IngestedDoc {
  filename: string;
  source_name: string;
  file_path: string;
  file_size: number;
  chunk_count: number;
  created_at: string;
  ocr_applied?: boolean;
}

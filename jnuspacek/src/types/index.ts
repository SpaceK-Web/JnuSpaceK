export type Sentiment = 'positive' | 'negative' | 'neutral' | 'warning';

export interface AspectAnalysis {
  aspect: string;
  sentiment: Sentiment;
  target_keyword: string;
  nuance_note?: string;
}

export interface TextAnalysisResult {
  text: string;
  overall_sentiment: Sentiment;
  aspects: AspectAnalysis[];
}

export interface AudioProcessResponse {
  user_id: string;
  analysis: TextAnalysisResult;
}

export interface ChatResponse {
  user_id: string;
  reply: string;
}

export interface EntryResponse {
  key: string;
  value: string;
  detail?: string;
  time?: string;
  sentiment: Sentiment;
  is_system: boolean;
  description?: string;
}

export interface DashboardToday {
  user_id: string;
  date: string;
  entries: EntryResponse[];
  total: number;
}

export interface DailyRecord {
  user_id: string;
  date: string;
  entries: EntryResponse[];
  updated_at: string;
}

export interface DashboardHistory {
  user_id: string;
  records: DailyRecord[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  sentiment?: Sentiment;
}

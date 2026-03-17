// 타임스탬프 파싱 결과 타입
export interface ParsedDate {
    year: string;
    month: string;
    day: string;
    hour: string;
    minute: string;
    second: string;
    formatted: string;
    datetime: Date;
}

// 데이터 아이템 타입
export interface DataItem {
    timestamp: string;
    date: ParsedDate;
    content: string;
}

// API 응답 타입
export type ApiResponse = Record<string, string>;

// DataFetcher Props
export interface DataFetcherProps {
    onFetch: (days: number) => Promise<void>;
    loading: boolean;
}

// DataTable Props
export interface DataTableProps {
    data: DataItem[];
}

import React, { useState } from 'react';
import './App.css';
import DataFetcher from './components/DataFetcher';
import DataTable from './components/DataTable';
import { DataItem, ApiResponse } from './types';
import { parseTimestamp } from './utils/dateParser';

const App: React.FC = () => {
    const [data, setData] = useState<DataItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleFetchData = async (days: number): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `http://127.0.0.1:8000/interface/request/${days}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const jsonData: ApiResponse = await response.json();

            // 데이터 파싱 및 정렬
            const parsedData: DataItem[] = Object.entries(jsonData)
                .map(([timestamp, content]) => ({
                    timestamp,
                    date: parseTimestamp(timestamp),
                    content
                }))
                .sort((a, b) => new Date(b.date.datetime).getTime() - new Date(a.date.datetime).getTime());

            setData(parsedData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="App">
            <header className="app-header">
                <h1>📊 데이터 조회 시스템</h1>
                <p>FastAPI 백엔드와 연동된 React + TypeScript 앱</p>
            </header>

            <main className="app-main">
                <DataFetcher onFetch={handleFetchData} loading={loading} />

                {error && (
                    <div className="error-message">
                        <span className="error-icon">❌</span>
                        <p>{error}</p>
                    </div>
                )}

                {loading && (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>데이터 로딩 중...</p>
                    </div>
                )}

                {!loading && data.length > 0 && <DataTable data={data} />}

                {!loading && data.length === 0 && !error && (
                    <div className="empty-state">
                        <p>📭 데이터를 조회해주세요</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;

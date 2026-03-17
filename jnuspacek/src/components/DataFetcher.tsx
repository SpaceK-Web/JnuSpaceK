import React, { useState } from 'react';
import { DataFetcherProps } from '../types';
import '../styles/DataFetcher.css';

const DataFetcher: React.FC<DataFetcherProps> = ({ onFetch, loading }) => {
    const [days, setDays] = useState<number>(7);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value;
        if (value === '' || (parseInt(value) > 0 && parseInt(value) <= 365)) {
            setDays(value === '' ? 0 : parseInt(value));
        }
    };

    const handleFetch = (): void => {
        if (days && days > 0) {
            onFetch(days);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter') {
            handleFetch();
        }
    };

    return (
        <div className="fetcher-container">
            <div className="fetcher-card">
                <h2>🔍 데이터 조회</h2>
                <div className="input-group">
                    <label htmlFor="days-input">조회 기간 (일)</label>
                    <div className="input-wrapper">
                        <input
                            id="days-input"
                            type="number"
                            min="1"
                            max="365"
                            value={days}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            placeholder="조회할 기간을 입력하세요"
                            disabled={loading}
                        />
                        <span className="input-suffix">days</span>
                    </div>
                    <p className="input-help">1일부터 365일까지 조회 가능합니다</p>
                </div>

                <button
                    onClick={handleFetch}
                    disabled={loading || !days}
                    className="fetch-button"
                >
                    {loading ? (
                        <>
                            <span className="spinner-small"></span>
                            로딩 중...
                        </>
                    ) : (
                        <>
                            <span>🚀</span>
                            데이터 조회
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default DataFetcher;

import React, { useState } from 'react';
import { DataTableProps } from '../types';
import '../styles/DataTable.css';

const DataTable: React.FC<DataTableProps> = ({ data }) => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const toggleExpand = (index: number): void => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <div className="table-container">
            <div className="table-header">
                <h2>📋 조회 결과</h2>
                <span className="result-count">총 {data.length}개</span>
            </div>

            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th className="col-date">📅 기록 날짜</th>
                            <th className="col-content">📝 데이터</th>
                            <th className="col-action">작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <React.Fragment key={index}>
                                <tr
                                    className={`data-row ${expandedIndex === index ? 'expanded' : ''
                                        }`}
                                >
                                    <td className="col-date">
                                        <div className="date-display">
                                            <div className="date-main">
                                                {item.date.year}-{item.date.month}-{item.date.day}
                                            </div>
                                            <div className="time-main">
                                                {item.date.hour}:{item.date.minute}:{item.date.second}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="col-content">
                                        <div className="content-preview">
                                            {item.content.length > 50
                                                ? item.content.substring(0, 50) + '...'
                                                : item.content}
                                        </div>
                                    </td>
                                    <td className="col-action">
                                        <button
                                            onClick={() => toggleExpand(index)}
                                            className="expand-button"
                                            title={expandedIndex === index ? '축소' : '확대'}
                                        >
                                            {expandedIndex === index ? '▼' : '▶'}
                                        </button>
                                    </td>
                                </tr>
                                {expandedIndex === index && (
                                    <tr className="expanded-row">
                                        <td colSpan={3}>
                                            <div className="expanded-content">
                                                <div className="expanded-header">
                                                    <span className="expanded-title">전체 내용</span>
                                                    <span className="expanded-timestamp">
                                                        {item.date.formatted}
                                                    </span>
                                                </div>
                                                <div className="expanded-text">
                                                    {item.content}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;

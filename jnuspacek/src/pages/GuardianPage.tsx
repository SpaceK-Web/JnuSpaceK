import { useState, useEffect, useCallback } from 'react';
import { getTodayDashboard, getHistoryDashboard } from '../api/client';
import type { DashboardToday, DailyRecord, EntryResponse, Sentiment } from '../types';
import '../styles/guardian.css';

const USER_ID = 'elderly_001';

const ASPECTS: Record<string, { label: string; emoji: string }> = {
  loneliness:     { label: '외로움',   emoji: '🫂' },
  pain:           { label: '통증',     emoji: '🤕' },
  emotion:        { label: '감정',     emoji: '😊' },
  medication:     { label: '약 복용',  emoji: '💊' },
  nutrition:      { label: '식사',     emoji: '🍚' },
  sleep:          { label: '수면',     emoji: '😴' },
  safety:         { label: '안전',     emoji: '🛡️' },
  family:         { label: '가족',     emoji: '👨‍👩‍👧' },
  daily_activity: { label: '일상 활동', emoji: '🚶' },
};

const SENTIMENT_CFG: Record<Sentiment, { label: string; color: string; bg: string; icon: string; border: string }> = {
  positive: { label: '양호', color: '#166534', bg: '#dcfce7', icon: '😊', border: '#22c55e' },
  negative: { label: '주의', color: '#9a3412', bg: '#ffedd5', icon: '😟', border: '#f97316' },
  neutral:  { label: '보통', color: '#374151', bg: '#f3f4f6', icon: '😐', border: '#9ca3af' },
  warning:  { label: '위험', color: '#991b1b', bg: '#fee2e2', icon: '🚨', border: '#ef4444' },
};

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function todayStr() {
  return toLocalDateStr(new Date());
}

function weekAgoStr() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return toLocalDateStr(d);
}

function groupByKey(entries: EntryResponse[]): Record<string, EntryResponse[]> {
  return entries.reduce<Record<string, EntryResponse[]>>((acc, e) => {
    (acc[e.key] ??= []).push(e);
    return acc;
  }, {});
}

function worstSentiment(entries: EntryResponse[]): Sentiment {
  const order: Sentiment[] = ['warning', 'negative', 'neutral', 'positive'];
  for (const s of order) {
    if (entries.some((e) => e.sentiment === s)) return s;
  }
  return 'neutral';
}

function SentimentBadge({ s }: { s: Sentiment }) {
  const cfg = SENTIMENT_CFG[s];
  return (
    <span
      className="sentiment-badge"
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
}

function AlertSection({ entries }: { entries: EntryResponse[] }) {
  const alerts = entries.filter((e) => e.is_system || e.sentiment === 'warning');
  if (!alerts.length) return null;

  return (
    <div className="alert-section">
      <div className="alert-header">
        <span>🚨</span>
        <strong>주의가 필요한 사항 ({alerts.length}건)</strong>
      </div>
      {alerts.map((a, i) => (
        <div key={i} className="alert-item">
          <span className="alert-key">{ASPECTS[a.key]?.label ?? a.key}</span>
          <span className="alert-value">{a.value}</span>
          {a.detail && <span className="alert-detail">— {a.detail}</span>}
        </div>
      ))}
    </div>
  );
}

function HealthCard({ aspectKey, entries }: { aspectKey: string; entries: EntryResponse[] | undefined }) {
  const info = ASPECTS[aspectKey] ?? { label: aspectKey, emoji: '📋' };

  if (!entries?.length) {
    return (
      <div className="health-card health-card-empty" style={{ borderTopColor: '#e5e7eb' }}>
        <div className="health-card-header">
          <span className="health-card-emoji">{info.emoji}</span>
          <span className="health-card-title">{info.label}</span>
        </div>
        <p className="health-card-no-data">오늘 기록 없음</p>
      </div>
    );
  }

  const worst = worstSentiment(entries);
  const latest = entries[entries.length - 1];
  const cfg = SENTIMENT_CFG[worst];

  return (
    <div className="health-card" style={{ borderTopColor: cfg.border }}>
      <div className="health-card-header">
        <span className="health-card-emoji">{info.emoji}</span>
        <span className="health-card-title">{info.label}</span>
      </div>
      <SentimentBadge s={worst} />
      <p className="health-card-value">"{latest.value}"</p>
      {latest.detail && <p className="health-card-detail">{latest.detail}</p>}
      <p className="health-card-count">{entries.length}건 기록됨</p>
    </div>
  );
}

function HistoryRow({ record }: { record: DailyRecord }) {
  const [open, setOpen] = useState(false);
  const grouped = groupByKey(record.entries);
  const alertCnt = record.entries.filter((e) => e.is_system || e.sentiment === 'warning').length;
  const negCnt   = record.entries.filter((e) => e.sentiment === 'negative').length;
  const posCnt   = record.entries.filter((e) => e.sentiment === 'positive').length;

  return (
    <div className="history-row">
      <button className="history-row-header" onClick={() => setOpen((o) => !o)}>
        <span className="history-date">{record.date}</span>
        <div className="history-badges">
          {alertCnt > 0 && <span className="badge badge-warning">🚨 위험 {alertCnt}</span>}
          {negCnt   > 0 && <span className="badge badge-negative">⚠️ 주의 {negCnt}</span>}
          {posCnt   > 0 && <span className="badge badge-positive">✅ 양호 {posCnt}</span>}
          {record.entries.length === 0 && <span className="badge badge-neutral">기록 없음</span>}
        </div>
        <span className="expand-arrow">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="history-detail">
          {Object.keys(grouped).length === 0 ? (
            <p className="no-data-text">해당 날짜의 데이터가 없습니다.</p>
          ) : (
            Object.entries(grouped).map(([key, entries]) => {
              const info = ASPECTS[key] ?? { label: key, emoji: '📋' };
              return (
                <div key={key} className="history-aspect-row">
                  <span className="aspect-emoji">{info.emoji}</span>
                  <span className="aspect-label">{info.label}</span>
                  <SentimentBadge s={worstSentiment(entries)} />
                  <span className="aspect-values">
                    {entries.map((e) => e.value).join(', ')}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default function GuardianPage() {
  const [today, setToday] = useState<DashboardToday | null>(null);
  const [history, setHistory] = useState<DailyRecord[]>([]);
  const [startDate, setStartDate] = useState(weekAgoStr());
  const [endDate, setEndDate] = useState(todayStr());
  const [todayLoading, setTodayLoading]   = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [todayError, setTodayError]     = useState('');
  const [historyError, setHistoryError] = useState('');

  const loadToday = useCallback(async () => {
    setTodayLoading(true);
    setTodayError('');
    try {
      setToday(await getTodayDashboard(USER_ID));
    } catch (e) {
      setTodayError(e instanceof Error ? e.message : '오늘 데이터를 불러오지 못했습니다.');
    } finally {
      setTodayLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError('');
    try {
      const data = await getHistoryDashboard(USER_ID, startDate, endDate);
      setHistory([...data.records].sort((a, b) => b.date.localeCompare(a.date)));
    } catch (e) {
      setHistoryError(e instanceof Error ? e.message : '기록을 불러오지 못했습니다.');
    } finally {
      setHistoryLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { loadToday(); }, [loadToday]);

  const grouped = today ? groupByKey(today.entries) : {};
  const overallSentiment: Sentiment = today?.entries.length
    ? worstSentiment(today.entries)
    : 'neutral';

  const warnCnt = today?.entries.filter((e) => e.is_system || e.sentiment === 'warning').length ?? 0;
  const posCnt  = today?.entries.filter((e) => e.sentiment === 'positive').length ?? 0;

  return (
    <div className="guardian-page">
      <header className="guardian-header">
        <div>
          <h1 className="guardian-title">👨‍👩‍👧 보호자 대시보드</h1>
          <p className="guardian-subtitle">
            {todayStr()} 기준 · 사용자: {USER_ID}
          </p>
        </div>
      </header>

      <div className="guardian-body">
        {/* ─── Today ─── */}
        <section className="guardian-section">
          <div className="section-title-row">
            <h2 className="section-title">📅 오늘 현황</h2>
            <button className="refresh-btn" onClick={loadToday} disabled={todayLoading}>
              {todayLoading ? '로딩 중...' : '새로고침'}
            </button>
          </div>

          {todayError && <p className="error-text">⚠️ {todayError}</p>}

          {todayLoading ? (
            <div className="loading-box">데이터를 불러오는 중...</div>
          ) : today ? (
            <>
              <AlertSection entries={today.entries} />

              <div className="summary-grid">
                <div className="summary-card">
                  <p className="summary-label">전체 상태</p>
                  <div style={{ marginTop: 4 }}>
                    <SentimentBadge s={overallSentiment} />
                  </div>
                </div>
                <div className="summary-card">
                  <p className="summary-label">오늘 기록</p>
                  <p className="summary-value">{today.total}<span style={{ fontSize: 14, fontWeight: 400 }}>건</span></p>
                </div>
                <div className="summary-card">
                  <p className="summary-label">위험 알림</p>
                  <p className="summary-value warning-text">{warnCnt}<span style={{ fontSize: 14, fontWeight: 400, color: '#dc2626' }}>건</span></p>
                </div>
                <div className="summary-card">
                  <p className="summary-label">긍정 신호</p>
                  <p className="summary-value positive-text">{posCnt}<span style={{ fontSize: 14, fontWeight: 400, color: '#16a34a' }}>건</span></p>
                </div>
              </div>

              <h3 className="section-sub-title">건강 항목별 현황</h3>
              <div className="health-grid">
                {Object.keys(ASPECTS).map((key) => (
                  <HealthCard key={key} aspectKey={key} entries={grouped[key]} />
                ))}
              </div>
            </>
          ) : (
            <div className="empty-box">오늘 아직 대화 기록이 없습니다.</div>
          )}
        </section>

        {/* ─── History ─── */}
        <section className="guardian-section">
          <h2 className="section-title" style={{ marginBottom: 20 }}>📊 기간별 기록</h2>

          <div className="history-filter">
            <div className="date-group">
              <label>시작일</label>
              <input
                type="date"
                value={startDate}
                max={endDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="date-group">
              <label>종료일</label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                max={todayStr()}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <button className="load-btn" onClick={loadHistory} disabled={historyLoading}>
              {historyLoading ? '조회 중...' : '조회하기'}
            </button>
          </div>

          {historyError && <p className="error-text">⚠️ {historyError}</p>}

          {history.length > 0 ? (
            <div className="history-list">
              {history.map((r) => (
                <HistoryRow key={r.date} record={r} />
              ))}
            </div>
          ) : (
            !historyLoading && (
              <div className="empty-box">
                날짜 범위를 선택하고 조회하기를 눌러주세요.
              </div>
            )
          )}
        </section>
      </div>
    </div>
  );
}

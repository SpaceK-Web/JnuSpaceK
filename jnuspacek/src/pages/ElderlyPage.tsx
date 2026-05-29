import { useState, useRef, useCallback, useEffect } from 'react';
import { processAudio, sendChatMessage } from '../api/client';
import type { ChatMessage, Sentiment } from '../types';
import '../styles/elderly.css';

const USER_ID = 'elderly_001';

const SENTIMENT_BORDER: Record<Sentiment, string> = {
  positive: '#16a34a',
  negative: '#ea580c',
  neutral: '#9ca3af',
  warning: '#dc2626',
};

function getMimeType(): string {
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus';
  if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm';
  if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) return 'audio/ogg;codecs=opus';
  return 'audio/mp4';
}

export default function ElderlyPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'assistant',
      text: '안녕하세요! 오늘 기분은 어떠세요?\n아래 마이크 버튼을 누르고 말씀해 주세요. 😊',
      timestamp: new Date(),
    },
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [recSec, setRecSec] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getMimeType();
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start(250);
      recorderRef.current = recorder;
      setIsRecording(true);
      setRecSec(0);
      setStatusText('녹음 중입니다... 말씀해 주세요');

      timerRef.current = setInterval(() => setRecSec((s) => s + 1), 1000);
    } catch {
      setStatusText('마이크를 사용할 수 없습니다. 권한을 확인해 주세요.');
    }
  }, []);

  const stopAndSend = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    setRecSec(0);

    recorder.onstop = async () => {
      recorder.stream.getTracks().forEach((t) => t.stop());

      const mimeType = recorder.mimeType || 'audio/webm';
      const blob = new Blob(chunksRef.current, { type: mimeType });

      setIsLoading(true);
      setStatusText('음성을 분석하고 있습니다...');

      try {
        const audioResult = await processAudio(USER_ID, blob);
        const userText = audioResult.analysis.text;

        if (!userText.trim()) {
          setStatusText('음성이 인식되지 않았습니다. 다시 시도해 주세요.');
          setIsLoading(false);
          return;
        }

        const userMsg: ChatMessage = {
          id: `u-${Date.now()}`,
          role: 'user',
          text: userText,
          timestamp: new Date(),
          sentiment: audioResult.analysis.overall_sentiment,
        };
        setMessages((prev) => [...prev, userMsg]);
        setStatusText('답변을 생성하고 있습니다...');

        const chatResult = await sendChatMessage(USER_ID, userText);
        const aiMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: chatResult.reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        setStatusText('');
      } catch (err) {
        const msg = err instanceof Error ? err.message : '알 수 없는 오류';
        setStatusText(`오류가 발생했습니다: ${msg}`);
      } finally {
        setIsLoading(false);
      }
    };

    recorder.stop();
  }, []);

  const handleMic = () => {
    if (isLoading) return;
    if (isRecording) stopAndSend();
    else startRecording();
  };

  const fmtTime = (d: Date) =>
    d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="elderly-page">
      <header className="elderly-header">
        <div className="elderly-header-left">
          <span className="elderly-avatar-icon">🤖</span>
          <div>
            <h1 className="elderly-title">돌봄이</h1>
            <p className="elderly-subtitle">AI 건강 돌봄 서비스</p>
          </div>
        </div>
      </header>

      <div className="chat-scroll-area">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-row ${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="assistant-avatar">🤖</div>
            )}
            <div
              className={`message-bubble ${msg.role}`}
              style={
                msg.role === 'user' && msg.sentiment
                  ? { borderBottom: `3px solid ${SENTIMENT_BORDER[msg.sentiment]}` }
                  : undefined
              }
            >
              <p className="message-text">{msg.text}</p>
              <span className="message-time">{fmtTime(msg.timestamp)}</span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message-row assistant">
            <div className="assistant-avatar">🤖</div>
            <div className="message-bubble assistant loading-bubble">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="input-bar">
        {statusText && <p className="status-line">{statusText}</p>}

        <div className="mic-wrapper">
          <button
            className={`mic-btn${isRecording ? ' recording' : ''}${isLoading ? ' loading' : ''}`}
            onClick={handleMic}
            disabled={isLoading}
            aria-label={isRecording ? '녹음 중지' : '녹음 시작'}
          >
            {isLoading ? '⏳' : isRecording ? '⏹' : '🎤'}
          </button>
          {isRecording && (
            <div className="record-indicator">
              <span className="rec-dot" />
              <span className="rec-time">{recSec}초</span>
            </div>
          )}
        </div>

        <p className="mic-label">
          {isLoading
            ? '처리 중...'
            : isRecording
            ? '버튼을 다시 누르면 전송됩니다'
            : '버튼을 누르고 말씀해 주세요'}
        </p>
      </div>
    </div>
  );
}

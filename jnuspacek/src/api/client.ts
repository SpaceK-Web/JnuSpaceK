import type {
  AudioProcessResponse,
  ChatResponse,
  DashboardHistory,
  DashboardToday,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export async function processAudio(
  userId: string,
  audioBlob: Blob
): Promise<AudioProcessResponse> {
  const ext = audioBlob.type.split('/')[1]?.split(';')[0] || 'webm';
  const form = new FormData();
  form.append('user_id', userId);
  form.append('audio', audioBlob, `recording.${ext}`);

  const res = await fetch(`${BASE_URL}/api/audio/process`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`음성 처리 실패 (${res.status}): ${msg}`);
  }
  return res.json();
}

export async function sendChatMessage(
  userId: string,
  message: string
): Promise<ChatResponse> {
  const res = await fetch(`${BASE_URL}/api/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, message }),
  });
  if (!res.ok) throw new Error(`채팅 실패 (${res.status})`);
  return res.json();
}

export async function getTodayDashboard(userId: string): Promise<DashboardToday> {
  const res = await fetch(`${BASE_URL}/api/dashboard/today/${userId}`);
  if (!res.ok) throw new Error(`오늘 대시보드 조회 실패 (${res.status})`);
  return res.json();
}

export async function getHistoryDashboard(
  userId: string,
  startDate: string,
  endDate: string
): Promise<DashboardHistory> {
  const url = `${BASE_URL}/api/dashboard/history/${userId}?start_date=${startDate}&end_date=${endDate}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`기록 조회 실패 (${res.status})`);
  return res.json();
}

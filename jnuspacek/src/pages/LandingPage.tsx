import { useNavigate } from 'react-router-dom';
import '../styles/landing.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-center">
        <span className="landing-icon">💙</span>
        <h1 className="landing-title">돌봄이</h1>
        <p className="landing-sub">누구세요?</p>
        <div className="landing-buttons">
          <button
            className="landing-btn elderly"
            onClick={() => navigate('/elderly')}
          >
            <span className="btn-icon">👴</span>
            <span className="btn-label">노약자</span>
            <span className="btn-desc">AI 돌봄이와 대화하기</span>
          </button>
          <button
            className="landing-btn guardian"
            onClick={() => navigate('/guardian')}
          >
            <span className="btn-icon">👨‍👩‍👧</span>
            <span className="btn-label">보호자</span>
            <span className="btn-desc">건강 현황 확인하기</span>
          </button>
        </div>
      </div>
    </div>
  );
}

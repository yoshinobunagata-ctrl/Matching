import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing">
      <div className="landing-bg">
        <div className="floating-heart h1">💕</div>
        <div className="floating-heart h2">💗</div>
        <div className="floating-heart h3">💖</div>
        <div className="floating-heart h4">💝</div>
      </div>

      <header className="landing-header">
        <div className="landing-logo">
          <span>💕</span>
          <span>LoveMatch</span>
        </div>
        <Link to="/login" className="btn btn-secondary">ログイン</Link>
      </header>

      <main className="landing-main">
        <div className="landing-content">
          <h1 className="landing-title">
            運命の出会いを<br />
            <span className="gradient-text">あなたに</span>
          </h1>
          <p className="landing-subtitle">
            累計マッチング数 1,000万組突破！<br />
            あなたにぴったりの相手が見つかる
          </p>

          <div className="landing-stats">
            <div className="stat">
              <span className="stat-number">25万人</span>
              <span className="stat-label">アクティブユーザー</span>
            </div>
            <div className="stat">
              <span className="stat-number">87%</span>
              <span className="stat-label">マッチング率</span>
            </div>
            <div className="stat">
              <span className="stat-number">3分</span>
              <span className="stat-label">平均マッチ時間</span>
            </div>
          </div>

          <div className="landing-cta">
            <Link to="/register" className="btn btn-primary btn-lg">
              無料ではじめる
            </Link>
            <p className="cta-note">※ 登録は無料・3分で完了</p>
          </div>
        </div>

        <div className="landing-visual">
          <div className="phone-mockup">
            <div className="phone-screen">
              <div className="demo-card">
                <img src="https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=300&h=400&fit=crop&crop=face" alt="" />
                <div className="demo-info">
                  <h3>ゆい, 23</h3>
                  <p>東京都 渋谷区</p>
                  <span className="online-badge">オンライン</span>
                </div>
              </div>
              <div className="demo-actions">
                <button className="demo-skip">✕</button>
                <button className="demo-like">♥</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <section className="features">
        <h2>LoveMatchの特徴</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <span className="feature-icon">🔒</span>
            <h3>安心・安全</h3>
            <p>24時間監視体制で不正ユーザーを排除</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">✨</span>
            <h3>高品質なユーザー</h3>
            <p>本人確認済みの真剣な出会いを求める方のみ</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">💬</span>
            <h3>簡単マッチング</h3>
            <p>相性の良い相手をAIがレコメンド</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>© 2024 LoveMatch - Demo Site</p>
      </footer>
    </div>
  );
};

export default Landing;

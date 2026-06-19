import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { likeApi } from '../services/api';
import './Matches.css';

const Matches = () => {
  const [tab, setTab] = useState('matches');
  const [matches, setMatches] = useState([]);
  const [receivedLikes, setReceivedLikes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [matchesData, likesData] = await Promise.all([
        likeApi.getMatches(),
        likeApi.getReceivedLikes()
      ]);
      setMatches(matchesData);
      setReceivedLikes(likesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeBack = async (userId) => {
    try {
      const result = await likeApi.sendLike(userId);
      if (result.matched) {
        loadData();
      }
    } catch (error) {
      console.error('Failed to like back:', error);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'たった今';
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;
    return date.toLocaleDateString('ja-JP');
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="matches-page">
      <div className="matches-header">
        <h1>マッチング</h1>
      </div>

      <div className="tabs">
        <button
          className={`tab ${tab === 'matches' ? 'active' : ''}`}
          onClick={() => setTab('matches')}
        >
          マッチ済み
          {matches.length > 0 && <span className="badge">{matches.length}</span>}
        </button>
        <button
          className={`tab ${tab === 'likes' ? 'active' : ''}`}
          onClick={() => setTab('likes')}
        >
          いいねされた
          {receivedLikes.length > 0 && <span className="badge">{receivedLikes.length}</span>}
        </button>
      </div>

      {tab === 'matches' && (
        <div className="matches-list">
          {matches.length > 0 ? (
            matches.map(match => (
              <Link
                key={match.match_id}
                to={`/messages/${match.match_id}`}
                className="match-item card"
              >
                <div className="match-avatar">
                  <img src={match.profile_image || 'https://via.placeholder.com/60'} alt="" className="avatar" />
                  {match.is_online ? <span className="online-dot"></span> : null}
                </div>
                <div className="match-info">
                  <div className="match-name">
                    <h3>{match.nickname}</h3>
                    <span className="match-time">{formatTime(match.last_message_at || match.matched_at)}</span>
                  </div>
                  <p className="match-preview">
                    {match.last_message || 'マッチングしました！メッセージを送ってみましょう'}
                  </p>
                </div>
                {match.unread_count > 0 && (
                  <span className="unread-badge">{match.unread_count}</span>
                )}
              </Link>
            ))
          ) : (
            <div className="empty-state">
              <span className="empty-icon">💝</span>
              <h3>まだマッチングがありません</h3>
              <p>気になる相手に「いいね」を送ってみましょう</p>
              <Link to="/home" className="btn btn-primary">相手を探す</Link>
            </div>
          )}
        </div>
      )}

      {tab === 'likes' && (
        <div className="likes-grid">
          {receivedLikes.length > 0 ? (
            receivedLikes.map(like => (
              <div key={like.id} className="like-card card">
                <Link to={`/user/${like.id}`} className="like-image">
                  <img src={like.profile_image || 'https://via.placeholder.com/200'} alt="" />
                  {like.is_online && <span className="online-badge">オンライン</span>}
                </Link>
                <div className="like-info">
                  <h3>{like.nickname}, {like.age}</h3>
                  <span className="like-time">{formatTime(like.liked_at)}</span>
                </div>
                <button
                  className="btn btn-primary like-back-btn"
                  onClick={() => handleLikeBack(like.id)}
                >
                  いいね返し
                </button>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <span className="empty-icon">💌</span>
              <h3>まだいいねがありません</h3>
              <p>プロフィールを充実させると「いいね」がもらいやすくなります</p>
              <Link to="/profile" className="btn btn-secondary">プロフィールを編集</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Matches;

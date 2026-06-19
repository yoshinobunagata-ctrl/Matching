import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userApi, likeApi } from '../services/api';
import './UserDetail.css';

const UserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchPopup, setMatchPopup] = useState(false);

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      const data = await userApi.getUser(id);
      setUser(data);
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (user.liked) return;

    try {
      const result = await likeApi.sendLike(user.id);
      setUser({ ...user, liked: true });

      if (result.matched) {
        setMatchPopup(true);
      }
    } catch (error) {
      console.error('Failed to like:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="not-found">
        <p>ユーザーが見つかりません</p>
        <Link to="/home" className="btn btn-primary">戻る</Link>
      </div>
    );
  }

  return (
    <div className="user-detail">
      <div className="user-detail-content">
        <div className="user-detail-gallery">
          <img src={user.profile_image || 'https://via.placeholder.com/500x600'} alt="" />
          {user.is_online && <span className="online-badge online-lg">オンライン</span>}
        </div>

        <div className="user-detail-info card">
          <div className="user-detail-header">
            <div>
              <h1>{user.nickname}, {user.age}</h1>
              <p className="user-location">{user.location}</p>
            </div>
          </div>

          <div className="user-stats">
            {user.height && (
              <div className="stat-item">
                <span className="stat-label">身長</span>
                <span className="stat-value">{user.height}cm</span>
              </div>
            )}
            {user.occupation && (
              <div className="stat-item">
                <span className="stat-label">職業</span>
                <span className="stat-value">{user.occupation}</span>
              </div>
            )}
          </div>

          {user.bio && (
            <div className="user-section">
              <h3>自己紹介</h3>
              <p>{user.bio}</p>
            </div>
          )}

          {user.interests && (
            <div className="user-section">
              <h3>趣味・興味</h3>
              <div className="interests-list">
                {user.interests.split(',').map((interest, i) => (
                  <span key={i} className="interest-tag">{interest.trim()}</span>
                ))}
              </div>
            </div>
          )}

          <div className="user-actions">
            <Link to="/home" className="btn btn-secondary">戻る</Link>
            <button
              className={`btn btn-primary btn-like-lg ${user.liked ? 'liked' : ''}`}
              onClick={handleLike}
              disabled={user.liked}
            >
              {user.liked ? '✓ いいね済み' : '♥ いいね！'}
            </button>
          </div>
        </div>
      </div>

      {matchPopup && (
        <div className="match-animation" onClick={() => setMatchPopup(false)}>
          <div className="match-content">
            <div className="hearts">💕</div>
            <h2>マッチング成立！</h2>
            <div className="match-profiles">
              <img src={user.profile_image} alt="" className="avatar avatar-lg" />
            </div>
            <p>{user.nickname}さんとマッチしました！</p>
            <p className="match-hint">メッセージを送ってみましょう</p>
            <Link to="/matches" className="btn btn-primary" onClick={() => setMatchPopup(false)}>
              メッセージを送る
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetail;

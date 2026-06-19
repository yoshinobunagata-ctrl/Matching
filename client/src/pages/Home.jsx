import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userApi, likeApi } from '../services/api';
import './Home.css';

const Home = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchPopup, setMatchPopup] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userApi.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (userId) => {
    try {
      const result = await likeApi.sendLike(userId);

      setUsers(users.map(user =>
        user.id === userId ? { ...user, liked: true } : user
      ));

      if (result.matched) {
        const matchedUser = users.find(u => u.id === userId);
        setMatchPopup(matchedUser);
      }
    } catch (error) {
      console.error('Failed to like:', error);
    }
  };

  const closeMatchPopup = () => {
    setMatchPopup(null);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="home">
      <div className="home-header">
        <h1>素敵な出会いを探そう</h1>
        <p>気になる相手に「いいね」を送ってみましょう</p>
      </div>

      <div className="user-grid">
        {users.map(user => (
          <div key={user.id} className="user-card card">
            <Link to={`/user/${user.id}`} className="user-card-image">
              <img src={user.profile_image || 'https://via.placeholder.com/300x400'} alt="" />
              {user.is_online ? (
                <span className="online-badge">オンライン</span>
              ) : null}
              <div className="user-card-overlay">
                <h3>{user.nickname}, {user.age}</h3>
                <p>{user.location}</p>
              </div>
            </Link>
            <div className="user-card-info">
              <div className="user-card-details">
                <span className="occupation">{user.occupation}</span>
                {user.height && <span className="height">{user.height}cm</span>}
              </div>
              <p className="user-card-bio">{user.bio}</p>
              <div className="user-card-interests">
                {user.interests?.split(',').slice(0, 3).map((interest, i) => (
                  <span key={i} className="interest-tag">{interest.trim()}</span>
                ))}
              </div>
            </div>
            <div className="user-card-actions">
              <button
                className={`btn btn-like ${user.liked ? 'liked' : ''}`}
                onClick={() => !user.liked && handleLike(user.id)}
                disabled={user.liked}
              >
                {user.liked ? '✓' : '♥'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="no-users">
          <p>表示できるユーザーがいません</p>
        </div>
      )}

      {matchPopup && (
        <div className="match-animation" onClick={closeMatchPopup}>
          <div className="match-content">
            <div className="hearts">💕</div>
            <h2>マッチング成立！</h2>
            <div className="match-profiles">
              <img src={matchPopup.profile_image} alt="" className="avatar avatar-lg" />
            </div>
            <p>{matchPopup.nickname}さんとマッチしました！</p>
            <p className="match-hint">メッセージを送ってみましょう</p>
            <Link to="/matches" className="btn btn-primary" onClick={closeMatchPopup}>
              メッセージを送る
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

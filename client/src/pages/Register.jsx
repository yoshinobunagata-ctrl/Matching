import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nickname: '',
    age: '',
    gender: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.gender) {
      setError('性別を選択してください');
      return;
    }

    setLoading(true);

    try {
      await register({
        ...formData,
        age: parseInt(formData.age)
      });
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/" className="auth-logo">
          <span>💕</span>
          <span>LoveMatch</span>
        </Link>

        <div className="auth-card">
          <h1>新規登録</h1>
          <p className="auth-subtitle">無料で素敵な出会いを始めよう</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>ニックネーム</label>
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                placeholder="ニックネームを入力"
                required
              />
            </div>

            <div className="input-group">
              <label>メールアドレス</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                required
              />
            </div>

            <div className="input-group">
              <label>パスワード</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="8文字以上で入力"
                minLength="6"
                required
              />
            </div>

            <div className="row">
              <div className="input-group">
                <label>年齢</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="25"
                  min="18"
                  max="99"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>性別</label>
              <div className="gender-select">
                <div
                  className={`gender-option ${formData.gender === 'male' ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, gender: 'male' })}
                >
                  <span className="icon">👨</span>
                  <span>男性</span>
                </div>
                <div
                  className={`gender-option ${formData.gender === 'female' ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, gender: 'female' })}
                >
                  <span className="icon">👩</span>
                  <span>女性</span>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
              {loading ? '登録中...' : '無料で登録する'}
            </button>
          </form>

          <p className="auth-switch">
            すでにアカウントをお持ちの方は <Link to="/login">ログイン</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

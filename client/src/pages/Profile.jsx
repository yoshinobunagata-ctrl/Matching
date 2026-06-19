import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../services/api';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    nickname: '',
    age: '',
    location: '',
    occupation: '',
    height: '',
    bio: '',
    interests: '',
    profile_image: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await userApi.getMyProfile();
      setFormData({
        nickname: data.nickname || '',
        age: data.age || '',
        location: data.location || '',
        occupation: data.occupation || '',
        height: data.height || '',
        bio: data.bio || '',
        interests: data.interests || '',
        profile_image: data.profile_image || ''
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await userApi.updateProfile({
        ...formData,
        age: parseInt(formData.age),
        height: formData.height ? parseInt(formData.height) : null
      });
      updateUser(formData);
      setMessage('プロフィールを更新しました！');
    } catch (error) {
      setMessage('更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="profile-header">
        <h1>プロフィール編集</h1>
        <p>魅力的なプロフィールを作成しましょう</p>
      </div>

      <div className="profile-content">
        <div className="profile-preview">
          <div className="preview-card card">
            <div className="preview-image">
              <img src={formData.profile_image || 'https://via.placeholder.com/300x400'} alt="" />
            </div>
            <div className="preview-info">
              <h3>{formData.nickname || 'ニックネーム'}, {formData.age || '?'}</h3>
              <p>{formData.location || '場所未設定'}</p>
            </div>
          </div>
          <p className="preview-hint">※ 他のユーザーからはこのように見えます</p>
        </div>

        <form className="profile-form card" onSubmit={handleSubmit}>
          {message && (
            <div className={`profile-message ${message.includes('失敗') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          <div className="input-group">
            <label>プロフィール画像URL</label>
            <input
              type="url"
              name="profile_image"
              value={formData.profile_image}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <div className="input-group">
            <label>ニックネーム</label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
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
                min="18"
                max="99"
              />
            </div>
            <div className="input-group">
              <label>身長 (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                min="100"
                max="250"
              />
            </div>
          </div>

          <div className="input-group">
            <label>居住地</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="東京都 渋谷区"
            />
          </div>

          <div className="input-group">
            <label>職業</label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              placeholder="エンジニア"
            />
          </div>

          <div className="input-group">
            <label>自己紹介</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              placeholder="自己紹介を入力してください"
            />
          </div>

          <div className="input-group">
            <label>趣味・興味 (カンマ区切り)</label>
            <input
              type="text"
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              placeholder="映画,旅行,料理"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? '保存中...' : 'プロフィールを保存'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;

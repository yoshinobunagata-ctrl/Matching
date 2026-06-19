import express from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// ユーザー一覧取得 (マッチング候補)
router.get('/', authenticateToken, (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const currentUser = db.prepare('SELECT gender FROM users WHERE id = ?').get(currentUserId);

    // 異性のユーザーを取得（自分以外）
    const targetGender = currentUser.gender === 'male' ? 'female' : 'male';

    const users = db.prepare(`
      SELECT
        u.id, u.nickname, u.age, u.gender, u.location, u.occupation,
        u.bio, u.interests, u.profile_image, u.height, u.is_online, u.last_active,
        CASE WHEN l.id IS NOT NULL THEN 1 ELSE 0 END as liked
      FROM users u
      LEFT JOIN likes l ON l.from_user_id = ? AND l.to_user_id = u.id
      WHERE u.id != ? AND u.gender = ?
      ORDER BY u.is_online DESC, u.last_active DESC
    `).all(currentUserId, currentUserId, targetGender);

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// ユーザー詳細取得
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, nickname, age, gender, location, occupation, bio, interests,
             profile_image, height, is_online, last_active
      FROM users WHERE id = ?
    `).get(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    // いいね済みかどうか
    const liked = db.prepare(`
      SELECT id FROM likes WHERE from_user_id = ? AND to_user_id = ?
    `).get(req.user.userId, req.params.id);

    res.json({ ...user, liked: !!liked });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 自分のプロフィール取得
router.get('/me/profile', authenticateToken, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, email, nickname, age, gender, location, occupation, bio,
             interests, profile_image, height
      FROM users WHERE id = ?
    `).get(req.user.userId);

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// プロフィール更新
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { nickname, age, location, occupation, bio, interests, height, profile_image } = req.body;

    db.prepare(`
      UPDATE users
      SET nickname = ?, age = ?, location = ?, occupation = ?, bio = ?,
          interests = ?, height = ?, profile_image = ?
      WHERE id = ?
    `).run(nickname, age, location, occupation, bio, interests, height, profile_image, req.user.userId);

    res.json({ message: 'プロフィールを更新しました' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

export default router;

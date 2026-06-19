import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/database.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// ユーザー登録
router.post('/register', async (req, res) => {
  try {
    const { email, password, nickname, age, gender } = req.body;

    // 既存ユーザーチェック
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: 'このメールアドレスは既に登録されています' });
    }

    // パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // ユーザー作成
    const result = db.prepare(`
      INSERT INTO users (email, password, nickname, age, gender)
      VALUES (?, ?, ?, ?, ?)
    `).run(email, hashedPassword, nickname, age, gender);

    const token = generateToken(result.lastInsertRowid);

    res.status(201).json({
      message: '登録が完了しました',
      token,
      user: {
        id: result.lastInsertRowid,
        email,
        nickname,
        age,
        gender
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// ログイン
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
    }

    // オンライン状態を更新
    db.prepare('UPDATE users SET is_online = 1, last_active = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        age: user.age,
        gender: user.gender,
        profile_image: user.profile_image,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// ログアウト
router.post('/logout', (req, res) => {
  // クライアント側でトークンを削除するだけ
  res.json({ message: 'ログアウトしました' });
});

export default router;

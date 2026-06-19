import express from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// いいね送信
router.post('/', authenticateToken, (req, res) => {
  try {
    const fromUserId = req.user.userId;
    const { toUserId } = req.body;

    // 自分自身へのいいね防止
    if (fromUserId === toUserId) {
      return res.status(400).json({ error: '自分自身にいいねはできません' });
    }

    // 既にいいね済みかチェック
    const existing = db.prepare(`
      SELECT id FROM likes WHERE from_user_id = ? AND to_user_id = ?
    `).get(fromUserId, toUserId);

    if (existing) {
      return res.status(400).json({ error: '既にいいね済みです' });
    }

    // いいね登録
    db.prepare(`
      INSERT INTO likes (from_user_id, to_user_id) VALUES (?, ?)
    `).run(fromUserId, toUserId);

    // 相手からもいいねされているかチェック (マッチング判定)
    const mutual = db.prepare(`
      SELECT id FROM likes WHERE from_user_id = ? AND to_user_id = ?
    `).get(toUserId, fromUserId);

    let matched = false;
    let matchId = null;

    if (mutual) {
      // マッチング成立！
      const matchResult = db.prepare(`
        INSERT INTO matches (user1_id, user2_id) VALUES (?, ?)
      `).run(Math.min(fromUserId, toUserId), Math.max(fromUserId, toUserId));

      matched = true;
      matchId = matchResult.lastInsertRowid;
    }

    res.json({
      message: matched ? 'マッチングが成立しました！' : 'いいねを送りました',
      matched,
      matchId
    });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// マッチング一覧取得
router.get('/matches', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;

    const matches = db.prepare(`
      SELECT
        m.id as match_id,
        m.created_at as matched_at,
        u.id, u.nickname, u.age, u.profile_image, u.is_online, u.last_active,
        (SELECT content FROM messages WHERE match_id = m.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE match_id = m.id ORDER BY created_at DESC LIMIT 1) as last_message_at,
        (SELECT COUNT(*) FROM messages WHERE match_id = m.id AND sender_id != ? AND is_read = 0) as unread_count
      FROM matches m
      JOIN users u ON (
        (m.user1_id = ? AND m.user2_id = u.id) OR
        (m.user2_id = ? AND m.user1_id = u.id)
      )
      ORDER BY last_message_at DESC, m.created_at DESC
    `).all(userId, userId, userId);

    res.json(matches);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// いいねしてくれた人一覧
router.get('/received', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;

    const likes = db.prepare(`
      SELECT
        u.id, u.nickname, u.age, u.profile_image, u.is_online,
        l.created_at as liked_at
      FROM likes l
      JOIN users u ON l.from_user_id = u.id
      WHERE l.to_user_id = ?
      AND NOT EXISTS (
        SELECT 1 FROM matches m
        WHERE (m.user1_id = ? AND m.user2_id = u.id)
        OR (m.user2_id = ? AND m.user1_id = u.id)
      )
      ORDER BY l.created_at DESC
    `).all(userId, userId, userId);

    res.json(likes);
  } catch (error) {
    console.error('Get received likes error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

export default router;

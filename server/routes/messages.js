import express from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// メッセージ一覧取得
router.get('/:matchId', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const matchId = req.params.matchId;

    // マッチングの存在確認と権限チェック
    const match = db.prepare(`
      SELECT * FROM matches WHERE id = ? AND (user1_id = ? OR user2_id = ?)
    `).get(matchId, userId, userId);

    if (!match) {
      return res.status(404).json({ error: 'マッチングが見つかりません' });
    }

    // メッセージ取得
    const messages = db.prepare(`
      SELECT
        m.id, m.content, m.sender_id, m.is_read, m.created_at,
        u.nickname as sender_name, u.profile_image as sender_image
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.match_id = ?
      ORDER BY m.created_at ASC
    `).all(matchId);

    // 未読メッセージを既読に
    db.prepare(`
      UPDATE messages SET is_read = 1
      WHERE match_id = ? AND sender_id != ? AND is_read = 0
    `).run(matchId, userId);

    // 相手の情報も取得
    const partnerId = match.user1_id === userId ? match.user2_id : match.user1_id;
    const partner = db.prepare(`
      SELECT id, nickname, profile_image, is_online, last_active
      FROM users WHERE id = ?
    `).get(partnerId);

    res.json({ messages, partner, matchId: parseInt(matchId) });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// メッセージ送信
router.post('/', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const { matchId, content } = req.body;

    // マッチングの存在確認と権限チェック
    const match = db.prepare(`
      SELECT * FROM matches WHERE id = ? AND (user1_id = ? OR user2_id = ?)
    `).get(matchId, userId, userId);

    if (!match) {
      return res.status(404).json({ error: 'マッチングが見つかりません' });
    }

    // メッセージ保存
    const result = db.prepare(`
      INSERT INTO messages (match_id, sender_id, content)
      VALUES (?, ?, ?)
    `).run(matchId, userId, content);

    const message = db.prepare(`
      SELECT
        m.id, m.content, m.sender_id, m.is_read, m.created_at,
        u.nickname as sender_name, u.profile_image as sender_image
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

export default router;

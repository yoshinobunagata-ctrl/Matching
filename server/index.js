import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import likeRoutes from './routes/likes.js';
import messageRoutes from './routes/messages.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 起動時にシードデータを投入（データがない場合）
const initializeData = async () => {
  const dataFile = join(__dirname, 'db', 'data.json');
  let needSeed = true;

  if (existsSync(dataFile)) {
    try {
      const data = JSON.parse(readFileSync(dataFile, 'utf-8'));
      if (data.users && data.users.length > 0) {
        needSeed = false;
        console.log('既存データを使用します');
      }
    } catch (e) {
      console.log('データファイルの読み込みエラー、シードを実行します');
    }
  }

  if (needSeed) {
    console.log('シードデータを投入中...');
    await import('./db/seed.js');
  }
};

await initializeData();

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェア
app.use(cors());
app.use(express.json());

// 静的ファイル配信 (プロフィール画像用)
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// ルート
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/messages', messageRoutes);

// ヘルスチェック
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'サーバーは正常に動作しています' });
});

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'サーバーエラーが発生しました' });
});

app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});

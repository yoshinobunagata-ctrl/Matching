import bcrypt from 'bcryptjs';
import db from './database.js';

// サンプルユーザーデータ (魅力的な日本人女性プロフィール)
const femaleUsers = [
  {
    email: 'yui@example.com',
    nickname: 'ゆい',
    age: 23,
    gender: 'female',
    location: '東京都 渋谷区',
    occupation: 'アパレル店員',
    height: 158,
    bio: '休みの日はカフェ巡りしてます☕ 一緒に美味しいコーヒー飲みに行きませんか？',
    interests: 'カフェ巡り,ファッション,映画鑑賞,料理',
    profile_image: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=400&h=500&fit=crop&crop=face',
    is_online: 1
  },
  {
    email: 'mio@example.com',
    nickname: 'みお',
    age: 25,
    gender: 'female',
    location: '東京都 港区',
    occupation: '看護師',
    height: 162,
    bio: '癒し系って言われます♪ お互いの時間を大切にできる関係が理想です',
    interests: 'ヨガ,温泉,グルメ,ペット',
    profile_image: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=400&h=500&fit=crop&crop=face',
    is_online: 1
  },
  {
    email: 'sakura@example.com',
    nickname: 'さくら',
    age: 22,
    gender: 'female',
    location: '神奈川県 横浜市',
    occupation: '大学生',
    height: 155,
    bio: '明るくて笑顔が取り柄です！一緒にいて楽しい人がタイプ💕',
    interests: 'ダンス,カラオケ,ドライブ,スイーツ',
    profile_image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&h=500&fit=crop&crop=face',
    is_online: 0
  },
  {
    email: 'rin@example.com',
    nickname: 'りん',
    age: 26,
    gender: 'female',
    location: '東京都 新宿区',
    occupation: 'Webデザイナー',
    height: 160,
    bio: 'クリエイティブな仕事してます✨ 美術館やギャラリー巡りが好き',
    interests: 'アート,デザイン,読書,音楽フェス',
    profile_image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop&crop=face',
    is_online: 1
  },
  {
    email: 'hana@example.com',
    nickname: 'はな',
    age: 24,
    gender: 'female',
    location: '東京都 世田谷区',
    occupation: '美容師',
    height: 163,
    bio: 'おしゃれと美容が大好き！素敵な出会いを探してます💄',
    interests: 'ヘアアレンジ,ネイル,ショッピング,韓国ドラマ',
    profile_image: 'https://images.unsplash.com/photo-1589571894960-20bbe2828d0a?w=400&h=500&fit=crop&crop=face',
    is_online: 1
  },
  {
    email: 'mei@example.com',
    nickname: 'めい',
    age: 27,
    gender: 'female',
    location: '千葉県 船橋市',
    occupation: '事務職',
    height: 157,
    bio: '穏やかな性格で聞き上手だと言われます🌸 まずは友達から始めたいです',
    interests: '料理,パン作り,散歩,写真',
    profile_image: 'https://images.unsplash.com/photo-1606122017369-d782bbb78f32?w=400&h=500&fit=crop&crop=face',
    is_online: 0
  },
  {
    email: 'nana@example.com',
    nickname: 'なな',
    age: 23,
    gender: 'female',
    location: '東京都 品川区',
    occupation: 'CA(客室乗務員)',
    height: 168,
    bio: '旅行が大好き！世界中の美味しいものを一緒に食べに行きたいな✈️',
    interests: '旅行,グルメ,語学,ワイン',
    profile_image: 'https://images.unsplash.com/photo-1545912452-8aea7e25a3d3?w=400&h=500&fit=crop&crop=face',
    is_online: 1
  },
  {
    email: 'aoi@example.com',
    nickname: 'あおい',
    age: 25,
    gender: 'female',
    location: '東京都 目黒区',
    occupation: 'インテリアコーディネーター',
    height: 161,
    bio: '居心地の良い空間作りが得意です🏠 おうちデートも好き',
    interests: 'インテリア,観葉植物,DIY,Netflix',
    profile_image: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&h=500&fit=crop&crop=face',
    is_online: 1
  },
  {
    email: 'sora@example.com',
    nickname: 'そら',
    age: 21,
    gender: 'female',
    location: '埼玉県 さいたま市',
    occupation: 'モデル',
    height: 170,
    bio: 'ちょっと人見知りだけど仲良くなると甘えん坊です🐱',
    interests: 'ファッション,コスメ,ピラティス,海',
    profile_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop&crop=face',
    is_online: 0
  },
  {
    email: 'emma@example.com',
    nickname: 'えま',
    age: 24,
    gender: 'female',
    location: '東京都 中央区',
    occupation: '受付嬢',
    height: 159,
    bio: '笑顔でいることを心がけてます😊 一緒に笑い合える人が理想',
    interests: 'お笑い,ゲーム,アニメ,ボウリング',
    profile_image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop&crop=face',
    is_online: 1
  }
];

// 男性ユーザー (デモ用)
const maleUsers = [
  {
    email: 'demo@example.com',
    nickname: 'デモユーザー',
    age: 28,
    gender: 'male',
    location: '東京都 渋谷区',
    occupation: 'エンジニア',
    height: 175,
    bio: 'マッチングサイトのデモ用アカウントです',
    interests: 'プログラミング,音楽,映画,旅行',
    profile_image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop&crop=face',
    is_online: 1
  }
];

async function seed() {
  console.log('シードデータを投入中...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 既存データを削除
  db.prepare('DELETE FROM messages').run();
  db.prepare('DELETE FROM matches').run();
  db.prepare('DELETE FROM likes').run();
  db.prepare('DELETE FROM users').run();

  // ユーザー挿入
  const insertUser = db.prepare(`
    INSERT INTO users (email, password, nickname, age, gender, location, occupation, height, bio, interests, profile_image, is_online)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const user of [...femaleUsers, ...maleUsers]) {
    insertUser.run(
      user.email, hashedPassword, user.nickname, user.age, user.gender,
      user.location, user.occupation, user.height, user.bio, user.interests,
      user.profile_image, user.is_online
    );
  }

  // デモユーザーへのいいねを追加 (期待感を演出)
  const demoUser = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@example.com');
  const allUsers = db.data.users.filter(u => u.gender === 'female');

  const insertLike = db.prepare('INSERT INTO likes (from_user_id, to_user_id) VALUES (?, ?)');

  // 女性からデモユーザーへのいいね (70%の確率)
  for (const female of allUsers) {
    if (Math.random() > 0.3) {
      insertLike.run(female.id, demoUser.id);
    }
  }

  console.log('シードデータの投入が完了しました！');
  console.log('デモアカウント: demo@example.com / password123');
}

seed();

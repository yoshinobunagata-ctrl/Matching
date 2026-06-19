import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_FILE = join(__dirname, 'data.json');

// 初期データ構造
const initialData = {
  users: [],
  likes: [],
  matches: [],
  messages: [],
  nextIds: { users: 1, likes: 1, matches: 1, messages: 1 }
};

// データを読み込む
const loadData = () => {
  if (existsSync(DATA_FILE)) {
    try {
      return JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
    } catch {
      return { ...initialData };
    }
  }
  return { ...initialData };
};

// データを保存
const saveData = (data) => {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// better-sqlite3互換のラッパー
class Database {
  constructor() {
    this.data = loadData();
  }

  prepare(sql) {
    const self = this;
    return {
      run(...params) {
        return self._execute(sql, params, 'run');
      },
      get(...params) {
        return self._execute(sql, params, 'get');
      },
      all(...params) {
        return self._execute(sql, params, 'all');
      }
    };
  }

  _execute(sql, params, mode) {
    const sqlLower = sql.toLowerCase().trim();

    // INSERT
    if (sqlLower.startsWith('insert into users')) {
      const id = this.data.nextIds.users++;
      const [email, password, nickname, age, gender, location, occupation, height, bio, interests, profile_image, is_online] = params;
      const user = {
        id, email, password, nickname, age, gender, location, occupation, height, bio, interests, profile_image,
        is_online: is_online || 0,
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString()
      };
      this.data.users.push(user);
      saveData(this.data);
      return { lastInsertRowid: id, changes: 1 };
    }

    if (sqlLower.startsWith('insert into likes')) {
      const id = this.data.nextIds.likes++;
      const [from_user_id, to_user_id] = params;
      this.data.likes.push({
        id, from_user_id, to_user_id,
        created_at: new Date().toISOString()
      });
      saveData(this.data);
      return { lastInsertRowid: id, changes: 1 };
    }

    if (sqlLower.startsWith('insert into matches')) {
      const id = this.data.nextIds.matches++;
      const [user1_id, user2_id] = params;
      this.data.matches.push({
        id, user1_id, user2_id,
        created_at: new Date().toISOString()
      });
      saveData(this.data);
      return { lastInsertRowid: id, changes: 1 };
    }

    if (sqlLower.startsWith('insert into messages')) {
      const id = this.data.nextIds.messages++;
      const [match_id, sender_id, content] = params;
      this.data.messages.push({
        id, match_id, sender_id, content, is_read: 0,
        created_at: new Date().toISOString()
      });
      saveData(this.data);
      return { lastInsertRowid: id, changes: 1 };
    }

    // SELECT by email
    if (sqlLower.includes('from users where email')) {
      const user = this.data.users.find(u => u.email === params[0]);
      return mode === 'get' ? user : (user ? [user] : []);
    }

    // SELECT user by id
    if (sqlLower.includes('from users where id') && !sqlLower.includes('join')) {
      const user = this.data.users.find(u => u.id === params[0]);
      return mode === 'get' ? user : (user ? [user] : []);
    }

    // SELECT users list (complex query with likes)
    if (sqlLower.includes('from users u') && sqlLower.includes('left join likes')) {
      const currentUserId = params[0];
      const targetGender = params[2];
      return this.data.users
        .filter(u => u.id !== currentUserId && u.gender === targetGender)
        .map(u => ({
          ...u,
          liked: this.data.likes.some(l => l.from_user_id === currentUserId && l.to_user_id === u.id) ? 1 : 0
        }))
        .sort((a, b) => b.is_online - a.is_online);
    }

    // SELECT gender
    if (sqlLower.includes('select gender from users')) {
      const user = this.data.users.find(u => u.id === params[0]);
      return mode === 'get' ? user : (user ? [user] : []);
    }

    // SELECT likes
    if (sqlLower.includes('from likes where from_user_id') && sqlLower.includes('to_user_id')) {
      const like = this.data.likes.find(l => l.from_user_id === params[0] && l.to_user_id === params[1]);
      return mode === 'get' ? like : (like ? [like] : []);
    }

    // SELECT matches
    if (sqlLower.includes('from matches m') && sqlLower.includes('join users u')) {
      const userId = params[1];
      return this.data.matches
        .filter(m => m.user1_id === userId || m.user2_id === userId)
        .map(m => {
          const partnerId = m.user1_id === userId ? m.user2_id : m.user1_id;
          const partner = this.data.users.find(u => u.id === partnerId);
          const matchMessages = this.data.messages.filter(msg => msg.match_id === m.id);
          const lastMsg = matchMessages[matchMessages.length - 1];
          const unread = matchMessages.filter(msg => msg.sender_id !== userId && !msg.is_read).length;
          return {
            match_id: m.id,
            matched_at: m.created_at,
            ...partner,
            last_message: lastMsg?.content,
            last_message_at: lastMsg?.created_at,
            unread_count: unread
          };
        });
    }

    // SELECT match by id
    if (sqlLower.includes('from matches where id')) {
      const match = this.data.matches.find(m => m.id === parseInt(params[0]) &&
        (m.user1_id === params[1] || m.user2_id === params[2]));
      return mode === 'get' ? match : (match ? [match] : []);
    }

    // SELECT received likes
    if (sqlLower.includes('from likes l') && sqlLower.includes('join users u on l.from_user_id')) {
      const userId = params[0];
      return this.data.likes
        .filter(l => l.to_user_id === userId)
        .filter(l => !this.data.matches.some(m =>
          (m.user1_id === userId && m.user2_id === l.from_user_id) ||
          (m.user2_id === userId && m.user1_id === l.from_user_id)
        ))
        .map(l => {
          const user = this.data.users.find(u => u.id === l.from_user_id);
          return { ...user, liked_at: l.created_at };
        });
    }

    // SELECT messages
    if (sqlLower.includes('from messages m') && sqlLower.includes('join users u')) {
      const matchId = parseInt(params[0]);
      return this.data.messages
        .filter(m => m.match_id === matchId)
        .map(m => {
          const sender = this.data.users.find(u => u.id === m.sender_id);
          return {
            ...m,
            sender_name: sender?.nickname,
            sender_image: sender?.profile_image
          };
        });
    }

    // SELECT single message by id
    if (sqlLower.includes('from messages m') && sqlLower.includes('where m.id')) {
      const msg = this.data.messages.find(m => m.id === params[0]);
      if (msg) {
        const sender = this.data.users.find(u => u.id === msg.sender_id);
        return mode === 'get' ? {
          ...msg,
          sender_name: sender?.nickname,
          sender_image: sender?.profile_image
        } : [];
      }
      return mode === 'get' ? undefined : [];
    }

    // UPDATE user profile
    if (sqlLower.includes('update users') && sqlLower.includes('set nickname')) {
      const [nickname, age, location, occupation, bio, interests, height, profile_image, id] = params;
      const user = this.data.users.find(u => u.id === id);
      if (user) {
        Object.assign(user, { nickname, age, location, occupation, bio, interests, height, profile_image });
        saveData(this.data);
      }
      return { changes: 1 };
    }

    // UPDATE online status
    if (sqlLower.includes('update users set is_online')) {
      const user = this.data.users.find(u => u.id === params[0]);
      if (user) {
        user.is_online = 1;
        user.last_active = new Date().toISOString();
        saveData(this.data);
      }
      return { changes: 1 };
    }

    // UPDATE messages read
    if (sqlLower.includes('update messages set is_read')) {
      const matchId = parseInt(params[0]);
      const senderId = params[1];
      this.data.messages.forEach(m => {
        if (m.match_id === matchId && m.sender_id !== senderId) {
          m.is_read = 1;
        }
      });
      saveData(this.data);
      return { changes: 1 };
    }

    // DELETE all (for seed)
    if (sqlLower.startsWith('delete from')) {
      if (sqlLower.includes('messages')) this.data.messages = [];
      if (sqlLower.includes('matches')) this.data.matches = [];
      if (sqlLower.includes('likes')) this.data.likes = [];
      if (sqlLower.includes('users')) {
        this.data.users = [];
        this.data.nextIds = { users: 1, likes: 1, matches: 1, messages: 1 };
      }
      saveData(this.data);
      return { changes: 0 };
    }

    console.log('Unhandled SQL:', sql, params);
    return mode === 'get' ? undefined : [];
  }

  exec(sql) {
    // テーブル作成は無視（JSONストレージなので不要）
  }
}

const db = new Database();

export default db;

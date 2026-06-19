const API_BASE = import.meta.env.VITE_API_URL || '/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'エラーが発生しました');
  }
  return data;
};

// 認証API
export const authApi = {
  register: async (userData) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  login: async (email, password) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(response);
  },

  logout: async () => {
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleResponse(response);
  }
};

// ユーザーAPI
export const userApi = {
  getUsers: async () => {
    const response = await fetch(`${API_BASE}/users`, {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  getUser: async (id) => {
    const response = await fetch(`${API_BASE}/users/${id}`, {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  getMyProfile: async () => {
    const response = await fetch(`${API_BASE}/users/me/profile`, {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(profileData)
    });
    return handleResponse(response);
  }
};

// いいね・マッチングAPI
export const likeApi = {
  sendLike: async (toUserId) => {
    const response = await fetch(`${API_BASE}/likes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ toUserId })
    });
    return handleResponse(response);
  },

  getMatches: async () => {
    const response = await fetch(`${API_BASE}/likes/matches`, {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  getReceivedLikes: async () => {
    const response = await fetch(`${API_BASE}/likes/received`, {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  }
};

// メッセージAPI
export const messageApi = {
  getMessages: async (matchId) => {
    const response = await fetch(`${API_BASE}/messages/${matchId}`, {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  sendMessage: async (matchId, content) => {
    const response = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ matchId, content })
    });
    return handleResponse(response);
  }
};

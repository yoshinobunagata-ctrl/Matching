import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { messageApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './Messages.css';

const Messages = () => {
  const { matchId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [partner, setPartner] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const data = await messageApi.getMessages(matchId);
      setMessages(data.messages);
      setPartner(data.partner);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const message = await messageApi.sendMessage(matchId, newMessage.trim());
      setMessages([...messages, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' });
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(msg => {
      const date = new Date(msg.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="messages-page">
      <div className="messages-header">
        <Link to="/matches" className="back-btn">←</Link>
        <Link to={`/user/${partner?.id}`} className="partner-info">
          <img src={partner?.profile_image || 'https://via.placeholder.com/40'} alt="" className="avatar" />
          <div>
            <h3>{partner?.nickname}</h3>
            {partner?.is_online ? (
              <span className="online-text">オンライン</span>
            ) : (
              <span className="offline-text">オフライン</span>
            )}
          </div>
        </Link>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="messages-empty">
            <p>メッセージがありません</p>
            <p>最初のメッセージを送ってみましょう！</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              <div className="date-divider">
                <span>{formatDate(msgs[0].created_at)}</span>
              </div>
              {msgs.map(message => (
                <div
                  key={message.id}
                  className={`message ${message.sender_id === user.id ? 'sent' : 'received'}`}
                >
                  {message.sender_id !== user.id && (
                    <img src={message.sender_image || 'https://via.placeholder.com/32'} alt="" className="message-avatar" />
                  )}
                  <div className="message-content">
                    <p>{message.content}</p>
                    <span className="message-time">{formatTime(message.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-input" onSubmit={handleSend}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="メッセージを入力..."
          disabled={sending}
        />
        <button type="submit" className="send-btn" disabled={!newMessage.trim() || sending}>
          送信
        </button>
      </form>
    </div>
  );
};

export default Messages;

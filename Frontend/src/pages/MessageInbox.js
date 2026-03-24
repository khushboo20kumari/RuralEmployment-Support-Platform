import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Container, Card, ListGroup, Badge, Form, Button, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { messageAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import useMediaQuery from '@mui/material/useMediaQuery';



const MessageInbox = () => {
  const { user } = useContext(AuthContext);
  const [chats, setChats] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedChatId, setSelectedChatId] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesContainerRef = useRef(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;
  const [showSidebar, setShowSidebar] = useState(!isMobile);

  // Always scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const isCurrentUserId = useCallback((id) => String(id || '') === String(user?._id || ''), [user?._id]);

  const getChatDisplayInfo = useCallback((chat) => {
    if (chat.chatType === 'group') {
      return {
        title: chat.groupName || chat.jobId?.title || 'Support Group',
        subtitle: chat.jobId?.title ? `Job: ${chat.jobId.title}` : 'Group support chat',
        path: '',
      };
    }

    const participants = chat.participants || [];
    const otherParticipant = participants.find((participant) => !isCurrentUserId(participant?._id));

    if (otherParticipant) {
      return {
        title: otherParticipant.name || 'User',
        subtitle: `${otherParticipant.userType || 'user'}${otherParticipant.phone ? ` • ${otherParticipant.phone}` : ''}`,
        path: '',
      };
    }

    const worker = chat.workerId;
    const employer = chat.employerId;
    const fallbackOther = isCurrentUserId(worker?._id) ? employer : worker;

    return {
      title: fallbackOther?.name || 'User',
      subtitle: `${fallbackOther?.userType || 'user'}`,
      path: '',
    };
  }, [isCurrentUserId]);

  const selectedChat = useMemo(
    () => chats.find((chat) => chat._id === selectedChatId) || null,
    [chats, selectedChatId]
  );

  const selectedChatInfo = useMemo(
    () => (selectedChat ? getChatDisplayInfo(selectedChat) : null),
    [selectedChat, getChatDisplayInfo]
  );

  const getDirectOtherUserId = useCallback((chat) => {
    const participants = chat?.participants || [];
    const other = participants.find((participant) => !isCurrentUserId(participant?._id));
    if (other?._id) return other._id;

    const fallbackOther = isCurrentUserId(chat?.workerId?._id) ? chat?.employerId : chat?.workerId;
    return fallbackOther?._id || null;
  }, [isCurrentUserId]);

  const fetchMessagesForChat = useCallback(async (chat) => {
    if (!chat) {
      setMessages([]);
      return;
    }

    try {
      if (chat.chatType === 'group') {
        const response = await messageAPI.getGroupMessages(chat._id);
        setMessages(response.data?.messages || []);
      } else {
        const otherUserId = getDirectOtherUserId(chat);
        if (!otherUserId) {
          setMessages([]);
          return;
        }
        const response = await messageAPI.getMessages(otherUserId);
        setMessages(response.data?.messages || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load chat messages');
    }
  }, [getDirectOtherUserId]);

  const fetchInbox = useCallback(async (silent = false) => {
    try {
      const [chatsRes, unreadRes] = await Promise.all([
        messageAPI.getAllChats(),
        messageAPI.getUnreadCount(),
      ]);

      setChats(chatsRes.data?.chats || []);
      setUnreadCount(Number(unreadRes.data?.unreadCount || 0));

      const fetchedChats = chatsRes.data?.chats || [];
      if (fetchedChats.length > 0) {
        setSelectedChatId((prev) => prev || fetchedChats[0]._id);
      }
    } catch (error) {
      if (!silent) {
        toast.error(error.response?.data?.message || 'Unable to load messages');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInbox();
  }, [fetchInbox]);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchInbox(true);
    }, 4000);

    return () => clearInterval(timer);
  }, [fetchInbox]);

  useEffect(() => {
    if (!selectedChat) return;
    fetchMessagesForChat(selectedChat);
  }, [selectedChat, fetchMessagesForChat]);

  useEffect(() => {
    if (!selectedChat) return;

    const timer = setInterval(() => {
      fetchMessagesForChat(selectedChat);
    }, 3000);

    return () => clearInterval(timer);
  }, [selectedChat, fetchMessagesForChat]);

  // Removed auto-scroll to bottom/top on messages update

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedChat || !newMessage.trim()) return;

    try {
      setSending(true);
      if (selectedChat.chatType === 'group') {
        await messageAPI.sendGroupMessage(selectedChat._id, { message: newMessage.trim() });
      } else {
        const otherUserId = getDirectOtherUserId(selectedChat);
        if (!otherUserId) {
          toast.error('Receiver not found');
          return;
        }
        await messageAPI.sendMessage({ receiverId: otherUserId, message: newMessage.trim() });
      }

      setNewMessage('');
      await fetchMessagesForChat(selectedChat);
      await fetchInbox();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to send message');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 600) {
        setShowSidebar(false);
      } else {
        setShowSidebar(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div className="my-5 text-center">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  // Main chat UI
  return (
    <div style={{ minHeight: '100vh', height: '100vh', maxHeight: '100vh', overflow: 'auto', display: 'flex', flexDirection: 'column', background: '#ece5dd' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isMobile ? '12px 10px 8px 10px' : '24px 32px 12px 32px', background: '#075e54', borderBottom: '2px solid #25d366' }}>
        <h4 style={{ margin: 0, fontWeight: 700, letterSpacing: 1, color: '#fff', fontSize: isMobile ? 18 : 24 }}>💬 Messages Inbox</h4>
        <span style={{ background: unreadCount > 0 ? '#dc3545' : '#6c757d', color: '#fff', borderRadius: 12, padding: isMobile ? '2px 8px' : '4px 14px', fontWeight: 600, fontSize: isMobile ? 13 : 15 }}>
          Unread: {unreadCount}
        </span>
        {isMobile && (
          <Button variant="light" size="sm" style={{ marginLeft: 8 }} onClick={() => setShowSidebar((s) => !s)}>
            {showSidebar ? 'Hide Chats' : 'Show Chats'}
          </Button>
        )}
      </div>
      <div style={{ display: 'flex', flex: 1, minHeight: 0, height: '100%', flexDirection: isMobile ? 'column' : 'row' }}>
        {/* Sidebar */}
        {(!isMobile || showSidebar) && (
          <div style={{ flex: isMobile ? '0 0 auto' : '0 0 320px', maxWidth: isMobile ? '100%' : 320, minWidth: isMobile ? '100%' : 200, background: '#fff', borderRight: isMobile ? 'none' : '1px solid #e0e0e0', height: isMobile ? 'auto' : '100%', display: 'flex', flexDirection: 'column', zIndex: 2 }}>
            <div style={{ fontWeight: 700, fontSize: isMobile ? 16 : 20, padding: isMobile ? '12px 10px' : '20px 24px', borderBottom: '1px solid #eee', color: '#075e54', letterSpacing: 1 }}>Chats</div>
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
              {chats.length === 0 ? (
                <div style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>No chats yet.<br />{user?.userType === 'worker' && (<StartAdminChatButton />)}</div>
              ) : (
                chats.map((chat) => {
                  const info = getChatDisplayInfo(chat);
                  const isActive = selectedChatId === chat._id;
                  return (
                    <div
                      key={chat._id}
                      onClick={() => {
                        setSelectedChatId(chat._id);
                        if (isMobile) setShowSidebar(false);
                      }}
                      style={{
                        padding: isMobile ? '10px 12px' : '14px 18px',
                        cursor: 'pointer',
                        background: isActive ? '#e7fbe7' : 'transparent',
                        borderLeft: isActive && !isMobile ? '4px solid #25d366' : '4px solid transparent',
                        marginBottom: 2,
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'background 0.2s',
                      }}
                    >
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(info.title || 'U')}&background=25d366&color=fff&rounded=true&size=38`} alt="avatar" style={{ width: isMobile ? 32 : 38, height: isMobile ? 32 : 38, borderRadius: '50%', marginRight: 10, boxShadow: isActive ? '0 2px 8px #25d36633' : 'none' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: isMobile ? 14 : 16 }}>{info.title}</div>
                        <div style={{ fontSize: isMobile ? 11 : 13, color: '#888' }}>{info.subtitle}</div>
                        <div style={{ fontSize: isMobile ? 10 : 12, color: '#aaa', marginTop: 2 }}>
                          {chat.lastMessage || 'No message yet'}
                          {chat.lastMessageTime ? ` • ${new Date(chat.lastMessageTime).toLocaleString('en-IN')}` : ''}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
        {/* Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#ece5dd', minHeight: 0 }}>
          <div style={{ background: '#075e54', color: '#fff', padding: isMobile ? '12px 10px' : '18px 28px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontWeight: 700, fontSize: isMobile ? 16 : 22, letterSpacing: 1 }}>{selectedChatInfo?.title || 'Select a chat'}</div>
            <div style={{ fontSize: isMobile ? 11 : 14, color: '#e0e0e0' }}>{selectedChatInfo?.subtitle || ''}</div>
          </div>
          <div ref={messagesContainerRef} style={{overflowY:"auto", flex: 1, minHeight: 0, background: 'url(https://i.imgur.com/4M7IWwP.png)', display: 'flex', flexDirection: 'column', padding: isMobile ? '10px 6px 8px 6px' : '18px 18px 10px 18px', gap: 2 }}>
            {messages.length === 0 ? (
              <div style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>No messages yet.</div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = isCurrentUserId(msg.senderId?._id);
                const showSenderName = !isMe && msg.senderId?.name && (selectedChat?.chatType === 'group' || (idx === 0 || messages[idx-1]?.senderId?._id !== msg.senderId?._id));
                return (
                  <div
                    key={msg._id}
                    style={{display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', marginBottom: isMobile ? 4 : 8}}
                  >
                    {showSenderName && (
                      <div style={{ fontWeight: 600, color: '#075e54', marginBottom: 2, marginLeft: 6, fontSize: isMobile ? 12 : 14 }}>{msg.senderId?.name}</div>
                    )}
                    <div
                      style={{
                        display: 'inline-block',
                        maxWidth: isMobile ? '90%' : '75%',
                        minWidth: 40,
                        padding: isMobile ? '8px 12px' : '12px 18px',
                        borderRadius: 18,
                        background: isMe ? '#dcf8c6' : '#fff',
                        color: '#222',
                        fontSize: isMobile ? 14 : 16,
                        boxShadow: isMe ? '0 2px 8px 0 #25d36633' : '0 1px 4px 0 rgba(0,0,0,0.08)',
                        wordBreak: 'break-word',
                        marginLeft: isMe ? (isMobile ? 12 : 24) : 0,
                        marginRight: isMe ? 0 : (isMobile ? 12 : 24),
                        borderBottomRightRadius: isMe ? 6 : 18,
                        borderBottomLeftRadius: isMe ? 18 : 6,
                        borderTopLeftRadius: 18,
                        borderTopRightRadius: 18,
                        transition: 'background 0.2s',
                        border: isMe ? '1px solid #b2f7cc' : '1px solid #ece5dd',
                        position: 'relative',
                      }}
                    >
                      <div>{msg.message}</div>
                      <div style={{ fontSize: isMobile ? 10 : 12, color: '#888', marginTop: 4, textAlign: 'right' }}>{new Date(msg.createdAt).toLocaleTimeString('en-IN')}</div>
                      {isMe && (
                        <span style={{ position: 'absolute', bottom: 6, right: 10, fontSize: isMobile ? 10 : 12, color: '#25d366' }}>✓</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div style={{ background: '#f0f0f0', borderTop: '1px solid #eee', padding: isMobile ? '8px 6px' : '14px 18px', position: 'relative', width: '100%' }}>
            <Form onSubmit={handleSendMessage} style={{ width: '100%' }}>
              <div style={{ display: 'flex', gap: isMobile ? 4 : 10 }}>
                <Form.Control
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={!selectedChat || sending}
                  style={{ borderRadius: 20, fontSize: isMobile ? 13 : 16, padding: isMobile ? '7px 12px' : '10px 18px', flex: 1, border: '1px solid #ccc', background: '#fff', boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)' }}
                />
                <Button type="submit" disabled={!selectedChat || !newMessage.trim() || sending} style={{ borderRadius: 20, minWidth: isMobile ? 44 : 64, background: '#25d366', border: 'none', fontWeight: 700, fontSize: isMobile ? 13 : 16, boxShadow: '0 2px 8px 0 #25d36633' }}>
                  {sending ? '...' : 'Send'}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

function StartAdminChatButton() {
  const [loading, setLoading] = useState(false);
  const [admin, setAdmin] = useState(null);
  const { user } = useContext(AuthContext);
  const [error, setError] = useState('');
  const navigate = window.location ? window.location : null;

  const fetchAdmin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await messageAPI.getAdminContact();
      setAdmin(res.data.admin);
    } catch (e) {
      setError('Admin contact not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmin();
    // eslint-disable-next-line
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: 20 }}>
      <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Need assistance? Chat with our admin</div>
      {error && <div style={{ color: '#dc3545', fontSize: 14, marginBottom: 8 }}>{error}</div>}
      {loading ? (
        <div className="spinner-border text-primary" style={{ width: 24, height: 24 }} role="status" />
      ) : (
        admin && (
          <Button
            variant="success"
            size="sm"
            onClick={() => {
              window.open(`https://wa.me/${admin.phone}`, '_blank');
            }}
            style={{ borderRadius: 20, paddingLeft: 16, paddingRight: 16, fontSize: 14, fontWeight: 600 }}
          >
            Chat with Admin
          </Button>
        )
      )}
    </div>
  );
}

export default MessageInbox;

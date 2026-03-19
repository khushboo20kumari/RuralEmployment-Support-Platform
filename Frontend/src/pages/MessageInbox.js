import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Container, Card, ListGroup, Badge, Form, Button, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { messageAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';



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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px 12px 32px', background: '#075e54', borderBottom: '2px solid #25d366' }}>
        <h4 style={{ margin: 0, fontWeight: 700, letterSpacing: 1, color: '#fff' }}>💬 Messages Inbox</h4>
        <span style={{ background: unreadCount > 0 ? '#dc3545' : '#6c757d', color: '#fff', borderRadius: 12, padding: '4px 14px', fontWeight: 600, fontSize: 15 }}>
          Unread: {unreadCount}
        </span>
      </div>
      <div style={{ display: 'flex', flex: 1, minHeight: 0, height: '100%' }}>
        {/* Sidebar + Chat Area as one container */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0, height: '100%', background: '#ece5dd', boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)' }}>
          {/* Sidebar */}
          <div style={{ flex: '0 0 320px', maxWidth: 320, minWidth: 200, background: '#fff', borderRight: '1px solid #e0e0e0', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 700, fontSize: 20, padding: '20px 24px', borderBottom: '1px solid #eee', color: '#075e54', letterSpacing: 1 }}>Chats</div>
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
              {chats.length === 0 ? (
                <div style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>No chats yet.</div>
              ) : (
                chats.map((chat) => {
                  const info = getChatDisplayInfo(chat);
                  const isActive = selectedChatId === chat._id;
                  return (
                    <div
                      key={chat._id}
                      onClick={() => setSelectedChatId(chat._id)}
                      style={{
                        padding: '14px 18px',
                        cursor: 'pointer',
                        background: isActive ? '#f0f0f0' : 'transparent',
                        borderLeft: isActive ? '4px solid #25d366' : '4px solid transparent',
                        marginBottom: 2,
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'background 0.2s',
                      }}
                    >
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#e0eafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#075e54', fontSize: 18, marginRight: 14 }}>
                        {info.title?.[0] || 'U'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 16 }}>{info.title}</div>
                        <div style={{ fontSize: 13, color: '#888' }}>{info.subtitle}</div>
                        <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>
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
          {/* Chat Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: '#075e54', color: '#fff', padding: '18px 28px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>{selectedChatInfo?.title || 'Select a chat'}</div>
              <div style={{ fontSize: 14, color: '#e0e0e0' }}>{selectedChatInfo?.subtitle || ''}</div>
            </div>
            <div  ref={messagesContainerRef} style={{overflowY:"auto", flex: 1, minHeight: 0, background: 'transparent', display: 'flex', flexDirection: 'column', padding: '18px 18px 10px 18px', gap: 2 }}>
              {messages.length === 0 ? (
                <div style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>No messages yet.</div>
              ) : (
                messages.map((msg) => {
                  const isMe = isCurrentUserId(msg.senderId?._id);
                  return (
                    <div
                      key={msg._id}
                      style={{display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 8}}
                    >
                      <div
                        style={{
                          display: 'inline-block',
                          maxWidth: '75%',
                          minWidth: 40,
                          padding: '12px 18px',
                          borderRadius: 18,
                          background: isMe ? '#d9fdd3' : '#fff',
                          color: '#222',
                          fontSize: 16,
                          boxShadow: isMe ? '0 2px 8px 0 rgba(76,175,80,0.08)' : '0 1px 4px 0 rgba(0,0,0,0.08)',
                          wordBreak: 'break-word',
                          marginLeft: isMe ? 24 : 0,
                          marginRight: isMe ? 0 : 24,
                          borderBottomRightRadius: isMe ? 6 : 18,
                          borderBottomLeftRadius: isMe ? 18 : 6,
                          borderTopLeftRadius: 18,
                          borderTopRightRadius: 18,
                          transition: 'background 0.2s',
                          border: isMe ? '1px solid #b2f7cc' : '1px solid #ece5dd',
                        }}
                      >
                        {selectedChat?.chatType === 'group' && !isMe && (
                          <div style={{ fontWeight: 600, color: '#075e54', marginBottom: 2 }}>{msg.senderId?.name || 'User'}</div>
                        )}
                        <div>{msg.message}</div>
                        <div style={{ fontSize: 12, color: '#888', marginTop: 4, textAlign: 'right' }}>{new Date(msg.createdAt).toLocaleTimeString('en-IN')}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div style={{ background: '#f0f0f0', borderTop: '1px solid #eee', padding: '14px 18px', position: 'relative', width: '100%' }}>
              <Form onSubmit={handleSendMessage} style={{ width: '100%' }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Form.Control
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={!selectedChat || sending}
                    style={{ borderRadius: 20, fontSize: 16, padding: '10px 18px', flex: 1, border: '1px solid #ccc', background: '#fff', boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)' }}
                  />
                  <Button type="submit" disabled={!selectedChat || !newMessage.trim() || sending} style={{ borderRadius: 20, minWidth: 64, background: '#25d366', border: 'none', fontWeight: 700, fontSize: 16, boxShadow: '0 2px 8px 0 rgba(76,175,80,0.08)' }}>
                    {sending ? '...' : 'Send'}
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default MessageInbox;

import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { messageAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Messages = () => {
  const { otherUserId, chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isGroupMode = !!chatId;
  
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [resolvedOtherUserId, setResolvedOtherUserId] = useState(otherUserId);
  const [groupMeta, setGroupMeta] = useState(null);
  const messagesEndRef = useRef(null);
  const isCurrentUserId = useCallback((id) => String(id || '') === String(user?._id || ''), [user?._id]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      toast.error('कृपया पहले लॉगिन करें');
      navigate('/login');
    }
  }, [user, navigate]);

  // Resolve admin alias to actual admin user id (private chat only)
  useEffect(() => {
    const resolveOtherUser = async () => {
      try {
        if (!user || !otherUserId || isGroupMode) return;

        if (otherUserId !== 'admin') {
          setResolvedOtherUserId(otherUserId);
          return;
        }

        const response = await messageAPI.getAdminContact();
        const adminId = response.data?.admin?._id;

        if (!adminId) {
          toast.error('Admin contact not found');
          return;
        }

        setResolvedOtherUserId(adminId);
        setOtherUser(response.data.admin);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Admin contact load failed');
      }
    };

    resolveOtherUser();
  }, [otherUserId, user, isGroupMode]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (isGroupMode) {
          const response = await messageAPI.getGroupMessages(chatId);
          setMessages(response.data.messages || []);
          setGroupMeta(response.data.chat || null);
        } else {
          const response = await messageAPI.getMessages(resolvedOtherUserId);
          setMessages(response.data.messages || []);

          // Get other user info from messages
          if (response.data.messages && response.data.messages.length > 0) {
            const msgs = response.data.messages;
            const firstMsg = msgs[0];
            const otherUserObj = isCurrentUserId(firstMsg?.senderId?._id)
              ? firstMsg?.receiverId
              : firstMsg?.senderId;
            setOtherUser(otherUserObj);
          } else {
            // Set basic structure if no messages yet
            setOtherUser((prev) => prev || { _id: resolvedOtherUserId, name: 'User' });
          }
        }
      } catch (error) {
        toast.error('संदेश लाने में त्रुटि');
      } finally {
        setLoading(false);
      }
    };

    if (user && (isGroupMode ? chatId : resolvedOtherUserId)) {
      fetchMessages();
    }
  }, [resolvedOtherUserId, user, chatId, isGroupMode, isCurrentUserId]);

  useEffect(() => {
    if (!user || !(isGroupMode ? chatId : resolvedOtherUserId)) return;

    const poll = async () => {
      try {
        if (isGroupMode) {
          const response = await messageAPI.getGroupMessages(chatId);
          setMessages(response.data.messages || []);
        } else {
          const response = await messageAPI.getMessages(resolvedOtherUserId);
          setMessages(response.data.messages || []);
        }
      } catch (error) {
        // silent polling failure
      }
    };

    const timer = setInterval(poll, 3000);
    return () => clearInterval(timer);
  }, [user, isGroupMode, chatId, resolvedOtherUserId]);

  // Scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      if (isGroupMode) {
        await messageAPI.sendGroupMessage(chatId, {
          message: newMessage.trim(),
        });
      } else {
        await messageAPI.sendMessage({
          receiverId: resolvedOtherUserId,
          message: newMessage.trim(),
        });
      }

      setNewMessage('');

      // Refresh messages
      let updatedMessages = [];
      if (isGroupMode) {
        const response = await messageAPI.getGroupMessages(chatId);
        updatedMessages = response.data.messages || [];
        setMessages(updatedMessages);
      } else {
        const response = await messageAPI.getMessages(resolvedOtherUserId);
        updatedMessages = response.data.messages || [];
        setMessages(updatedMessages);
      }

      // Scroll to bottom after sending
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);

      toast.success('संदेश भेजा गया');
    } catch (error) {
      toast.error('संदेश भेजने में त्रुटि');
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">लोड हो रहा है...</span>
        </div>
      </Container>
    );
  }

    return (
      <Container fluid className="p-0" style={{ minHeight: '100vh', background: '#f4f7fa', display: 'flex', flexDirection: 'column' }}>
        <Row className="justify-content-center" style={{ flex: 1, minHeight: '100vh' }}>
          <Col xs={12} md={8} lg={6} className="d-flex flex-column p-0" style={{ height: '100vh', boxShadow: '0 4px 32px 0 #bae6fd33', borderRadius: 18, background: '#fff', margin: '18px 0' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(90deg, #0ea5e9 0%, #38bdf8 100%)', color: '#fff', padding: '18px 24px', borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottom: '2px solid #bae6fd', display: 'flex', alignItems: 'center', gap: 18, minHeight: 70 }}>
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(isGroupMode ? (groupMeta?.groupName || groupMeta?.jobId?.title || 'G') : (otherUser?.name || 'U'))}&background=0ea5e9&color=fff&rounded=true&size=48`} alt="avatar" style={{ width: 48, height: 48, borderRadius: '50%', marginRight: 14, boxShadow: '0 2px 8px #38bdf833' }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: 0.5 }}>{isGroupMode ? (groupMeta?.groupName || groupMeta?.jobId?.title || 'Support Group') : (otherUser?.name || 'User')}</div>
                {!isGroupMode && !!otherUser?.phone && (
                  <div style={{ fontSize: 13, color: '#e0e0e0', marginTop: 2 }}>
                    <Button size="sm" variant="light" href={`tel:${otherUser.phone}`}>📞 Call</Button>
                  </div>
                )}
              </div>
            </div>
            {/* Chat Area */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', padding: '22px 12px 12px 12px', gap: 2 }}>
              {messages.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <p>कोई संदेश नहीं। बातचीत शुरू करें!</p>
                </div>
              ) : (
                <div>
                  {messages.map((msg, idx) => {
                    const isMe = isCurrentUserId(msg.senderId?._id);
                    const showSenderName = !isMe && msg.senderId?.name && (isGroupMode || (idx === 0 || messages[idx-1]?.senderId?._id !== msg.senderId?._id));
                    return (
                      <div key={msg._id} style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 10, flexDirection: isMe ? 'row-reverse' : 'row', gap: 10 }}>
                        {/* Avatar for each message */}
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderId?.name || 'U')}&background=${isMe ? '0ea5e9' : 'bae6fd'}&color=fff&rounded=true&size=36`} alt="avatar" style={{ width: 36, height: 36, borderRadius: '50%', boxShadow: '0 1px 4px #bae6fd33' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', width: '100%' }}>
                          {showSenderName && (
                            <div style={{ fontWeight: 700, color: '#0ea5e9', marginBottom: 2, fontSize: 14 }}>{msg.senderId?.name}</div>
                          )}
                          <div
                            style={{
                              display: 'inline-block',
                              maxWidth: '80%',
                              minWidth: 40,
                              padding: '13px 20px',
                              borderRadius: 18,
                              background: isMe ? 'linear-gradient(90deg, #bae6fd 0%, #0ea5e9 100%)' : '#f1f5f9',
                              color: isMe ? '#fff' : '#222',
                              fontSize: 16,
                              boxShadow: isMe ? '0 2px 8px 0 #bae6fd33' : '0 1px 4px 0 rgba(0,0,0,0.06)',
                              wordBreak: 'break-word',
                              marginLeft: isMe ? 0 : 0,
                              marginRight: isMe ? 0 : 0,
                              borderBottomRightRadius: isMe ? 6 : 18,
                              borderBottomLeftRadius: isMe ? 18 : 6,
                              borderTopLeftRadius: 18,
                              borderTopRightRadius: 18,
                              transition: 'background 0.2s',
                              border: isMe ? '1.5px solid #0ea5e9' : '1.5px solid #e0e7ef',
                              position: 'relative',
                            }}
                          >
                            <div>{msg.message}</div>
                            <div style={{ fontSize: 12, color: isMe ? '#e0f2fe' : '#888', marginTop: 4, textAlign: 'right' }}>{new Date(msg.createdAt).toLocaleTimeString('en-IN')}</div>
                            {isMe && (
                              <span style={{ position: 'absolute', bottom: 6, right: 10, fontSize: 12, color: '#bae6fd' }}>✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            {/* Input */}
            <div style={{ background: '#f8fafc', borderTop: '1.5px solid #e0e7ef', padding: '16px 20px', position: 'relative', width: '100%', borderBottomLeftRadius: 18, borderBottomRightRadius: 18 }}>
              <Form onSubmit={handleSendMessage} style={{ width: '100%' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Form.Control
                    type="text"
                    placeholder="अपना संदेश लिखें..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending}
                    style={{ borderRadius: 20, fontSize: 16, padding: '12px 20px', flex: 1, border: '1.5px solid #bae6fd', background: '#fff', boxShadow: '0 1px 4px 0 #bae6fd11' }}
                  />
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    style={{ borderRadius: 20, minWidth: 72, background: 'linear-gradient(90deg, #0ea5e9 0%, #38bdf8 100%)', border: 'none', fontWeight: 700, fontSize: 16, boxShadow: '0 2px 8px 0 #bae6fd33' }}
                  >
                    {sending ? 'भेजा जा रहा है...' : 'भेजें'}
                  </Button>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    );
};

export default Messages;

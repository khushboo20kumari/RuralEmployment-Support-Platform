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
      <Container className="my-5" style={{background:"red", minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Row className="flex-grow-1" style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Col md={8} className="mx-auto d-flex flex-column" style={{ height: '70vh', display: 'flex' }}>
            <Card className="flex-grow-1 d-flex flex-column" style={{ minHeight: 0, height: '100%' }}>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">💬 संदेश</h5>
              {isGroupMode
                ? <small>{groupMeta?.groupName || groupMeta?.jobId?.title || 'Support Group'}</small>
                : (otherUser && <small>{otherUser.name}</small>)}
              {!isGroupMode && !!otherUser?.phone && (
                <div className="mt-2">
                  <Button size="sm" variant="light" href={`tel:${otherUser.phone}`}>📞 Call</Button>
                </div>
              )}
            </Card.Header>

            <Card.Body
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                backgroundColor: '#f8f9fa',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                paddingBottom: 0,
              }}
            >
              {messages.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <p>कोई संदेश नहीं। बातचीत शुरू करें!</p>
                </div>
              ) : (
                <div>
                  {messages.map((msg) => (
                    <div
                      key={msg._id}
                      className="mb-3"
                      style={{
                        textAlign: isCurrentUserId(msg.senderId?._id) ? 'right' : 'left',
                      }}
                    >
                      <div
                        style={{
                          display: 'inline-block',
                          maxWidth: '70%',
                          padding: '10px 15px',
                          borderRadius: '10px',
                          backgroundColor:
                            isCurrentUserId(msg.senderId?._id)
                              ? '#007bff'
                              : '#e9ecef',
                          color:
                            isCurrentUserId(msg.senderId?._id) ? 'white' : 'black',
                          wordWrap: 'break-word',
                        }}
                      >
                        {isGroupMode && !isCurrentUserId(msg.senderId?._id) && (
                          <div className="small fw-semibold mb-1">{msg.senderId?.name || 'User'}</div>
                        )}
                        <p className="mb-1">{msg.message}</p>
                        <small
                          style={{
                            opacity: 0.7,
                            fontSize: '0.8rem',
                          }}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString('hi-IN')}
                          {msg.isRead && ' ✓✓'}
                        </small>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </Card.Body>

            <Card.Footer style={{ background: '#fff', borderTop: '1px solid #eee' }}>
              <Form onSubmit={handleSendMessage}>
                <div className="input-group">
                  <Form.Control
                    type="text"
                    placeholder="अपना संदेश लिखें..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending}
                  />
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                  >
                    {sending ? 'भेजा जा रहा है...' : 'भेजें'}
                  </Button>
                </div>
              </Form>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Messages;

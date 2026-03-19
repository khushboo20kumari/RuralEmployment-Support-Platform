import React, { useRef, useEffect, useState } from 'react';

// Dummy data for demonstration
const users = [
  { id: 1, name: 'Alice', online: true },
  { id: 2, name: 'Bob', online: false },
  { id: 3, name: 'Charlie', online: true },
];

const initialMessages = [
  { id: 1, senderId: 1, text: 'Hello!', timestamp: '10:00 AM' },
  { id: 2, senderId: 2, text: 'Hi Alice!', timestamp: '10:01 AM' },
  { id: 3, senderId: 1, text: 'How are you?', timestamp: '10:02 AM' },
];

function ChatList({ users, activeUserId, onSelect }) {
  return (
    <div className="h-full overflow-y-auto bg-white border-r border-gray-200 w-72 min-w-[200px] flex flex-col">
      <div className="p-4 font-bold text-lg border-b border-gray-100">Chats</div>
      {users.map((user) => (
        <div
          key={user.id}
          className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-100 transition ${activeUserId === user.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
          onClick={() => onSelect(user.id)}
        >
          <span className={`h-3 w-3 rounded-full ${user.online ? 'bg-green-400' : 'bg-gray-400'}`}></span>
          <span className="flex-1 font-medium text-gray-800">{user.name}</span>
          {user.online && <span className="text-xs text-green-500">Online</span>}
        </div>
      ))}
    </div>
  );
}

function MessageBubble({ message, isSent }) {
  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`rounded-2xl px-4 py-2 max-w-[70%] shadow-sm text-base relative ${
          isSent
            ? 'bg-blue-500 text-white rounded-br-md'
            : 'bg-gray-100 text-gray-900 rounded-bl-md'
        }`}
      >
        <div>{message.text}</div>
        <div className="text-xs text-gray-400 mt-1 text-right">{message.timestamp}</div>
      </div>
    </div>
  );
}

function ChatWindow({ messages, currentUserId }) {
  const chatRef = useRef(null);
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);
  return (
    <div
      ref={chatRef}
      className="flex-1 overflow-y-auto px-4 py-6 bg-chat-pattern bg-gray-50"
      style={{ backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}
    >
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} isSent={msg.senderId === currentUserId} />
      ))}
    </div>
  );
}

function InputBox({ value, onChange, onSend, isTyping }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && value.trim()) {
      onSend();
    }
  };
  return (
    <div className="flex items-center gap-2 p-4 border-t bg-white">
      <input
        className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 text-base"
        type="text"
        placeholder="Type a message..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 font-semibold transition flex items-center gap-1"
        onClick={onSend}
        disabled={!value.trim()}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-7.5-15-7.5v6.75l10.5 0-10.5 0v6.75z" />
        </svg>
        Send
      </button>
      {isTyping && <span className="ml-3 text-xs text-gray-400 animate-pulse">Typing...</span>}
    </div>
  );
}

export default function ModernChatApp() {
  const [activeUserId, setActiveUserId] = useState(users[0].id);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const currentUserId = 1; // Assume Alice is the current user

  // Simulate typing indicator
  useEffect(() => {
    if (input.trim()) {
      setIsTyping(true);
      const timeout = setTimeout(() => setIsTyping(false), 1200);
      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((msgs) => [
      ...msgs,
      {
        id: msgs.length + 1,
        senderId: currentUserId,
        text: input,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInput('');
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      {/* Sidebar */}
      <ChatList users={users} activeUserId={activeUserId} onSelect={setActiveUserId} />
      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 h-full">
        {/* Chat Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b bg-white shadow-sm">
          <span className={`h-3 w-3 rounded-full ${users.find(u => u.id === activeUserId)?.online ? 'bg-green-400' : 'bg-gray-400'}`}></span>
          <span className="font-semibold text-lg text-gray-800">{users.find(u => u.id === activeUserId)?.name}</span>
          <span className="ml-2 text-xs text-gray-500">{users.find(u => u.id === activeUserId)?.online ? 'Online' : 'Offline'}</span>
        </div>
        {/* Chat Window */}
        <ChatWindow messages={messages} currentUserId={currentUserId} />
        {/* Input Box */}
        <InputBox value={input} onChange={setInput} onSend={handleSend} isTyping={isTyping} />
      </div>
    </div>
  );
}

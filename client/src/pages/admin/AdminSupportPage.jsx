import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Bot, User, Clock, ShieldCheck, CheckCheck, MessageCircle } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

export default function AdminSupportPage() {
  const { user } = useAuth();
  const socket = useSocket();
  
  // Conversations list and active conversation selection
  const [conversations, setConversations] = useState([
    {
      id: 'ai_assistant',
      name: "Ma'ad Admin AI Assistant",
      role: 'AI_SYSTEM',
      messages: [
        {
          id: 1,
          sender: 'support',
          senderName: "Ma'ad Admin AI Assistant",
          text: `Welcome Admin ${user?.name || ''}! How can I assist you with system management, restaurant oversight, orders, or payment statistics today?`,
          timestamp: new Date(),
        }
      ]
    }
  ]);
  const [activeConvId, setActiveConvId] = useState('ai_assistant');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const activeConversation = conversations.find(c => c.id === activeConvId) || conversations[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations, activeConvId]);

  useEffect(() => {
    if (socket && user) {
      // Join admin global room to receive ALL incoming user and staff messages
      socket.emit('join_room', 'admin_global');
      socket.emit('join_user_room', user.id);

      const handleReceiveMessage = (msg) => {
        // Do not double append admin's own sent messages
        if (msg.senderId === user.id) return;

        const senderId = msg.senderId || msg.senderName || 'user_guest';
        const senderName = msg.senderName || msg.sender || 'Customer';
        const userRole = msg.userRole || 'User';

        setConversations((prev) => {
          const existingIndex = prev.findIndex((c) => c.id === senderId);
          if (existingIndex > -1) {
            const updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              messages: [...updated[existingIndex].messages, msg],
              lastMessage: msg.text,
              lastTime: msg.timestamp || new Date(),
            };
            return updated;
          } else {
            return [
              ...prev,
              {
                id: senderId,
                name: senderName,
                role: userRole,
                messages: [msg],
                lastMessage: msg.text,
                lastTime: msg.timestamp || new Date(),
              },
            ];
          }
        });
      };

      socket.on('receive_message', handleReceiveMessage);

      return () => {
        socket.off('receive_message', handleReceiveMessage);
      };
    }
  }, [socket, user]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const newMessage = {
      id: Date.now(),
      sender: 'admin',
      senderId: user.id,
      senderName: `${user.name} (Admin)`,
      userRole: 'ADMIN',
      recipientId: activeConversation.id,
      text: input.trim(),
      timestamp: new Date(),
    };

    // Update state locally
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? {
              ...c,
              messages: [...c.messages, newMessage],
              lastMessage: newMessage.text,
              lastTime: newMessage.timestamp,
            }
          : c
      )
    );

    setInput('');

    // Emit via Socket
    if (socket) {
      if (activeConvId === 'ai_assistant') {
        socket.emit('send_message', {
          ...newMessage,
          recipientId: 'ai_support',
          useAi: true,
        });
      } else {
        socket.emit('send_message', {
          ...newMessage,
          recipientId: activeConversation.id,
        });
      }
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Just now';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Title Header */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span>Admin Live Support Center</span>
              <span className="bg-orange-100 text-orange-700 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" /> Admin Control
              </span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Respond directly to live customer, chef, waiter, and driver messages, or chat with AI Assistant.
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-200">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-black text-emerald-700">Live Support Active</span>
          </div>
        </div>

        {/* Layout Grid: Left Sidebar Conversations + Right Chat View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 240px)' }}>
          {/* Conversations Sidebar */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-4 flex flex-col overflow-hidden">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-orange-500" />
              <span>Incoming Messages ({conversations.length})</span>
            </h2>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                    activeConvId === conv.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                      : 'bg-gray-50 hover:bg-orange-50 border-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs truncate max-w-[150px]">
                      {conv.name}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        activeConvId === conv.id
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {conv.role}
                    </span>
                  </div>
                  {conv.lastMessage && (
                    <p className={`text-xs truncate ${activeConvId === conv.id ? 'text-gray-300' : 'text-gray-500'}`}>
                      {conv.lastMessage}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Active Chat Conversation Area */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-gray-200 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-slate-900 to-gray-800 text-white rounded-t-3xl">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-500 text-white p-2.5 rounded-2xl shadow-md">
                  {activeConversation.role === 'AI_SYSTEM' ? (
                    <Bot className="w-6 h-6" />
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-white text-lg">{activeConversation.name}</h2>
                  <p className="text-xs text-gray-300">
                    Role: {activeConversation.role} • Direct Live Response
                  </p>
                </div>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/60">
              {activeConversation.messages.map((msg, index) => {
                const isAdmin = msg.sender === 'admin' || msg.userRole === 'ADMIN';

                return (
                  <div
                    key={msg.id || index}
                    className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xl ${isAdmin ? 'max-w-md' : ''}`}>
                      <div className={`flex items-center space-x-2 mb-1 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                        {!isAdmin && (
                          <div className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs">
                            👤
                          </div>
                        )}
                        <span className="text-xs font-bold text-gray-600">
                          {msg.senderName || (isAdmin ? 'You (Admin)' : 'Customer')}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(msg.timestamp || new Date())}</span>
                        </span>
                      </div>

                      <div
                        className={`p-4 rounded-2xl text-sm shadow-sm whitespace-pre-wrap ${
                          isAdmin
                            ? 'bg-slate-900 text-white rounded-br-md shadow-slate-900/10'
                            : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
                        }`}
                      >
                        {msg.text || msg.message}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* Send Message Form */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white flex items-center space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Type response to ${activeConversation.name}...`}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-200 transition"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white p-3.5 rounded-2xl shadow-lg transition flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
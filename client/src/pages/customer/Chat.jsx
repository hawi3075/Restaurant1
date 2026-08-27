import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Bot, User, Clock, CheckCheck } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import API from '../../services/api';

export default function Chat() {
  const { user } = useAuth();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [supportOnline, setSupportOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load chat history
  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  // Socket.IO real-time messaging & AI responses
  useEffect(() => {
    if (socket && user) {
      // Join user's personal chat room
      socket.emit('join_user_room', user.id);

      // Listen for incoming messages (including AI bot replies from server)
      socket.on('receive_message', (message) => {
        setMessages((prev) => [...prev, message]);
        setIsTyping(false); // Stop typing when response arrives
      });

      // Listen for typing indicator
      socket.on('user_typing', (data) => {
        if (data.userId !== user.id) {
          setIsTyping(true);
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
          }, 3000);
        }
      });

      // Listen for support status
      socket.on('support_status', (data) => {
        setSupportOnline(data.online);
      });

      return () => {
        socket.off('receive_message');
        socket.off('user_typing');
        socket.off('support_status');
      };
    }
  }, [socket, user]);

  const loadChatHistory = async () => {
    try {
      setLoading(true);
      const res = await API.get('/support');
      const dbMsgs = (res.data || []).map((msg) => ({
        id: msg.id,
        sender: msg.isFromAdmin ? 'support' : 'user',
        senderId: msg.senderId,
        senderName: msg.senderName,
        text: msg.text,
        timestamp: new Date(msg.createdAt),
        read: true,
      }));

      const welcomeMessage = {
        id: 1,
        sender: 'support',
        senderName: "Ma'ad Support",
        text: `Hello ${user?.name || 'there'}! Welcome to Ma'ad Support. How can we assist you with your food order, menu items, or payments today?`,
        timestamp: new Date(user?.createdAt || Date.now()),
        read: true,
      };

      setMessages([welcomeMessage, ...dbMsgs]);
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const newMessage = {
      id: Date.now(),
      sender: 'user',
      senderId: user.id,
      senderName: user.name,
      text: input.trim(),
      timestamp: new Date(),
      read: false,
    };

    // Add message to local state immediately
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setIsTyping(true); // Show typing indicator while waiting for Gemini AI

    // Emit message via Socket.IO to trigger server AI chatbot response
    if (socket) {
      socket.emit('send_message', {
        ...newMessage,
        recipientId: 'support', // Route to AI support handler on server
      });
    }
  };

  const handleTyping = () => {
    if (socket && user) {
      socket.emit('user_typing', {
        userId: user.id,
        userName: user.name,
      });
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="app-page">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
          
          {/* Chat Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-3xl">
            <div className="flex items-center space-x-4">
              <div className="bg-orange-600 text-white p-3 rounded-2xl shadow-lg">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-black text-gray-900 text-xl">Ma'ad AI Support Chat</h2>
                <p className={`text-sm font-bold flex items-center space-x-2 ${
                  supportOnline ? 'text-emerald-600' : 'text-gray-500'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    supportOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
                  }`}></span>
                  <span>{supportOnline ? 'AI Assistant Online' : 'Support Offline'}</span>
                </p>
              </div>
            </div>

            {user && (
              <div className="hidden sm:flex items-center space-x-3 bg-white px-4 py-2 rounded-xl border border-gray-200">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <User className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Logged in as</p>
                  <p className="text-sm font-bold text-gray-900">{user.name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Message History */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="w-20 h-20 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">No messages yet</p>
                <p className="text-sm text-gray-400 mt-2">Ask our AI assistant anything about your order or menu</p>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-md ${msg.sender === 'user' ? 'max-w-sm' : ''}`}>
                      {/* Sender Name & Time */}
                      <div className={`flex items-center space-x-2 mb-1 ${
                        msg.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}>
                        {msg.sender !== 'user' && (
                          <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                            <Bot className="w-4 h-4 text-orange-600" />
                          </div>
                        )}
                        <span className="text-xs font-bold text-gray-600">
                          {msg.senderName || (msg.sender === 'user' ? 'You' : "Ma'ad Support")}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(msg.timestamp || new Date())}</span>
                        </span>
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={`p-4 rounded-2xl text-sm shadow-sm whitespace-pre-wrap ${
                          msg.sender === 'user'
                            ? 'bg-orange-600 text-white rounded-br-md shadow-orange-600/10'
                            : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                        }`}
                      >
                        {msg.text}
                      </div>

                      {/* Read Receipt */}
                      {msg.sender === 'user' && (
                        <div className="flex justify-end mt-1">
                          <CheckCheck
                            className={`w-4 h-4 ${
                              msg.read ? 'text-blue-500' : 'text-gray-400'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-800 rounded-2xl rounded-bl-md border border-gray-100 p-4 shadow-sm flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-orange-600 animate-pulse" />
                      <div className="flex space-x-1.5">
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSend}
            className="p-4 border-t border-gray-200 bg-white flex items-center space-x-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                handleTyping();
              }}
              placeholder="Ask about menu items, orders, or Chapa payments..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
              disabled={!user}
            />
            <button
              type="submit"
              disabled={!input.trim() || !user}
              className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3.5 rounded-2xl shadow-lg shadow-orange-600/20 transition flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          {/* Quick Actions */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-3xl">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setInput('What traditional Ethiopian dishes do you have on the menu?')}
                className="px-3 py-1.5 bg-white hover:bg-orange-50 text-gray-700 hover:text-orange-600 rounded-lg text-xs font-medium border border-gray-200 hover:border-orange-300 transition"
              >
                🍲 Traditional Menu
              </button>
              <button
                type="button"
                onClick={() => setInput('How long does delivery take in Adama?')}
                className="px-3 py-1.5 bg-white hover:bg-orange-50 text-gray-700 hover:text-orange-600 rounded-lg text-xs font-medium border border-gray-200 hover:border-orange-300 transition"
              >
                🚚 Delivery Time & Fee
              </button>
              <button
                type="button"
                onClick={() => setInput('How do I complete my payment using Chapa?')}
                className="px-3 py-1.5 bg-white hover:bg-orange-50 text-gray-700 hover:text-orange-600 rounded-lg text-xs font-medium border border-gray-200 hover:border-orange-300 transition"
              >
                💳 Payment Issue
              </button>
              <button
                type="button"
                onClick={() => setInput('I need help tracking my recent food order.')}
                className="px-3 py-1.5 bg-white hover:bg-orange-50 text-gray-700 hover:text-orange-600 rounded-lg text-xs font-medium border border-gray-200 hover:border-orange-300 transition"
              >
                📦 Order Help
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
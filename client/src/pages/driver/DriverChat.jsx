import React, { useEffect, useState, useRef } from 'react';
import { Send, MessageSquare, Bot, User, Clock, CheckCheck, Bike } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

export default function DriverChat() {
  const { user } = useAuth();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    setMessages([
      {
        id: 1,
        sender: 'support',
        senderName: "Ma'ad Driver AI Assistant",
        text: `Welcome Driver ${user?.name || ''}! How can I assist you with delivery navigation in Adama, order pickups, delivery fees (50 ETB), or customer contacts today?`,
        timestamp: new Date(),
        read: true,
      },
    ]);
  }, [user]);

  useEffect(() => {
    if (socket && user) {
      socket.emit('join_user_room', user.id);

      socket.on('receive_message', (message) => {
        setMessages((prev) => [...prev, message]);
        setIsTyping(false);
      });

      socket.on('user_typing', (data) => {
        if (data.userId !== user.id) {
          setIsTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
        }
      });

      return () => {
        socket.off('receive_message');
        socket.off('user_typing');
      };
    }
  }, [socket, user]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const newMessage = {
      id: Date.now(),
      sender: 'user',
      senderId: user.id,
      senderName: user.name,
      userRole: 'DRIVER',
      text: input.trim(),
      timestamp: new Date(),
      read: false,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setIsTyping(true);

    if (socket) {
      socket.emit('send_message', {
        ...newMessage,
        recipientId: 'support',
      });
    }
  };

  const handleTyping = () => {
    if (socket && user) {
      socket.emit('user_typing', { userId: user.id, userName: user.name });
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-screen bg-gray-50/60 flex flex-col p-8">
      <div className="max-w-5xl w-full mx-auto flex-1 flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-600 to-amber-600 text-white">
          <div className="flex items-center space-x-4">
            <div className="bg-white text-orange-600 p-3.5 rounded-2xl shadow-md">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-xl text-white tracking-tight">Driver AI Assistant Chat</h2>
              <p className="text-xs text-orange-100 flex items-center space-x-2 mt-0.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Delivery Support Online</span>
              </p>
            </div>
          </div>

          {user && (
            <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-2xl text-xs backdrop-blur-sm border border-white/10">
              <User className="w-4 h-4 text-white" />
              <span className="font-bold text-white">Driver {user.name}</span>
            </div>
          )}
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/35">
          {messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-md ${msg.sender === 'user' ? 'max-w-sm' : ''}`}>
                <div className={`flex items-center space-x-2 mb-1 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender !== 'user' && (
                    <div className="w-6 h-6 bg-orange-50 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-orange-600" />
                    </div>
                  )}
                  <span className="text-xs font-bold text-gray-500">
                    {msg.senderName || (msg.sender === 'user' ? 'You' : "Driver AI")}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(msg.timestamp || new Date())}</span>
                  </span>
                </div>

                <div
                  className={`p-4 rounded-3xl text-sm shadow-sm whitespace-pre-wrap font-medium ${
                    msg.sender === 'user'
                      ? 'bg-orange-600 text-white rounded-br-md shadow-orange-600/10'
                      : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                  }`}
                >
                  {msg.text}
                </div>

                {msg.sender === 'user' && (
                  <div className="flex justify-end mt-1">
                    <CheckCheck className={`w-4 h-4 ${msg.read ? 'text-orange-500' : 'text-gray-300'}`} />
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 rounded-3xl rounded-bl-md border border-gray-100 p-4 shadow-sm flex items-center space-x-2">
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
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-white flex items-center space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleTyping();
            }}
            placeholder="Ask about Adama delivery navigation, customer dropoffs, or delivery fees..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition font-medium"
            disabled={!user}
          />
          <button
            type="submit"
            disabled={!input.trim() || !user}
            className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white p-3.5 rounded-2xl shadow-md shadow-orange-600/20 transition flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        {/* Quick Actions */}
        <div className="p-4 bg-gray-50/50 border-t border-gray-100 rounded-b-3xl">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setInput('What are the best navigation shortcuts for delivery in Adama?')}
              className="px-3.5 py-2 bg-white hover:bg-orange-50 text-gray-700 hover:text-orange-600 rounded-xl text-xs font-bold border border-gray-200 hover:border-orange-200 transition shadow-sm"
            >
              🚚 Adama Delivery Routes
            </button>
            <button
              type="button"
              onClick={() => setInput('What is the standard delivery fee policy (50 ETB)?')}
              className="px-3.5 py-2 bg-white hover:bg-orange-50 text-gray-700 hover:text-orange-600 rounded-xl text-xs font-bold border border-gray-200 hover:border-orange-200 transition shadow-sm"
            >
              💵 Delivery Fee Policy
            </button>
            <button
              type="button"
              onClick={() => setInput('What steps should I take if a customer is not answering the phone at drop-off?')}
              className="px-3.5 py-2 bg-white hover:bg-orange-50 text-gray-700 hover:text-orange-600 rounded-xl text-xs font-bold border border-gray-200 hover:border-orange-200 transition shadow-sm"
            >
              📞 Unreachable Customer
            </button>
            <button
              type="button"
              onClick={() => setInput('How do I verify food items before leaving the restaurant kitchen?')}
              className="px-3.5 py-2 bg-white hover:bg-orange-50 text-gray-700 hover:text-orange-600 rounded-xl text-xs font-bold border border-gray-200 hover:border-orange-200 transition shadow-sm"
            >
              📦 Order Verification
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
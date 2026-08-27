import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Clock, CheckCheck, ShieldCheck, Sparkles } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

export default function AdminAiChatPage() {
  const { user } = useAuth();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Initial welcome message from Admin Gemini AI
    setMessages([
      {
        id: 1,
        sender: 'support',
        senderName: "Ma'ad Admin AI Assistant",
        text: `Hello ${user?.name || 'Admin'}! 👋 I am your Ma'ad AI Assistant. Ask me anything about platform administration, restaurant management, POS setup, food approvals, or payment audits.`,
        timestamp: new Date(),
      },
    ]);
  }, [user]);

  useEffect(() => {
    if (socket && user) {
      socket.emit('join_user_room', user.id);

      const handleReceive = (message) => {
        setMessages((prev) => [...prev, message]);
        setIsTyping(false);
      };

      socket.on('receive_message', handleReceive);
      return () => {
        socket.off('receive_message', handleReceive);
      };
    }
  }, [socket, user]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      senderId: user.id,
      senderName: user.name,
      userRole: 'ADMIN',
      text: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    if (socket) {
      socket.emit('send_message', {
        ...userMessage,
        recipientId: 'ai_support',
        useAi: true,
      });
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Just now';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Title Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Admin AI Assistant</span>
              <span className="bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-bold">
                <Sparkles className="w-3.5 h-3.5" /> Powered by Gemini
              </span>
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Ask AI about platform workflows, restaurant branches, food catalog approval, POS, and revenue statistics.
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2 rounded-2xl border border-emerald-200 dark:border-emerald-800">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">AI Support Active</span>
          </div>
        </div>

        {/* Chat Window */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col" style={{ height: 'calc(100vh - 240px)' }}>
          {/* Header */}
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-slate-900 via-gray-900 to-slate-800 text-white rounded-t-3xl">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-500 text-white p-2.5 rounded-2xl shadow-md">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">Ma'ad System AI</h2>
                <p className="text-xs text-gray-300">Administrative Assistant</p>
              </div>
            </div>
            {user && (
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-xl text-xs backdrop-blur-sm">
                <ShieldCheck className="w-4 h-4 text-orange-400" />
                <span className="font-semibold text-gray-200">{user.name} (Admin)</span>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/60 dark:bg-gray-900/60">
            {messages.map((msg, index) => {
              const isUser = msg.sender === 'user';

              return (
                <div key={msg.id || index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xl ${isUser ? 'max-w-md' : ''}`}>
                    <div className={`flex items-center space-x-2 mb-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      {!isUser && (
                        <div className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center">
                          <Bot className="w-3.5 h-3.5 text-orange-400" />
                        </div>
                      )}
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                        {msg.senderName || (isUser ? 'You' : "Ma'ad Support AI")}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(msg.timestamp || new Date())}</span>
                      </span>
                    </div>

                    <div
                      className={`p-4 rounded-2xl text-sm shadow-sm whitespace-pre-wrap ${
                        isUser
                          ? 'bg-slate-900 dark:bg-orange-600 text-white rounded-br-md'
                          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-md border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {msg.text || msg.message}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-md border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-orange-500 animate-pulse" />
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Form */}
          <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI about restaurant administration, orders, POS, or payouts..."
              className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-slate-800 transition"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-slate-900 dark:bg-orange-600 hover:bg-slate-800 text-white p-3.5 rounded-2xl shadow-lg transition flex items-center justify-center disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          {/* Quick Prompts */}
          <div className="p-3 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-b-3xl">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setInput('How do I manage restaurant branches and employee roles?')}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-slate-100 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 transition"
              >
                🏬 Branch & Staff Roles
              </button>
              <button
                type="button"
                onClick={() => setInput('How do I approve or reject new food items submitted by chefs?')}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-slate-100 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 transition"
              >
                🍔 Food Item Approval
              </button>
              <button
                type="button"
                onClick={() => setInput('How do Chapa payment payouts work for restaurants?')}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-slate-100 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 transition"
              >
                💳 Chapa Payment Audit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

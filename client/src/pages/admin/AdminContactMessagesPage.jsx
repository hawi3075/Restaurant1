import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, User, Clock, CheckCheck, Inbox, ShieldCheck } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

export default function AdminContactMessagesPage() {
  const { user } = useAuth();
  const socket = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const activeConversation = conversations.find(c => c.id === activeConvId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations, activeConvId]);

  // Load historical messages from DB on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await API.get('/support');
        const msgs = res.data || [];
        // Group messages by senderId into conversations
        const convMap = {};
        msgs.forEach((msg) => {
          // Customer messages: group by senderId; admin replies: group by recipientId
          const convId = msg.isFromAdmin ? msg.recipientId : msg.senderId;
          if (!convId) return;
          if (!convMap[convId]) {
            convMap[convId] = {
              id: convId,
              name: msg.isFromAdmin ? (msg.recipientId || 'Customer') : msg.senderName,
              role: msg.senderRole,
              messages: [],
              lastMessage: '',
              lastTime: msg.createdAt,
            };
          }
          convMap[convId].messages.push({
            id: msg.id,
            sender: msg.isFromAdmin ? 'admin' : 'user',
            senderId: msg.senderId,
            senderName: msg.senderName,
            userRole: msg.senderRole,
            text: msg.text,
            timestamp: msg.createdAt,
          });
          convMap[convId].lastMessage = msg.text;
          convMap[convId].lastTime = msg.createdAt;
        });
        const convList = Object.values(convMap);
        if (convList.length > 0) {
          setConversations(convList);
          setActiveConvId(convList[0].id);
        }
      } catch (e) {
        console.error('Failed to load support history:', e);
      }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    if (socket && user) {
      // Join admin global room to receive incoming contact & support messages
      socket.emit('join_room', 'admin_global');
      socket.emit('join_user_room', user.id);

      const handleReceiveMessage = (msg) => {
        // Ignore messages sent by admin to self
        if (msg.senderId === user.id && msg.senderRole === 'ADMIN') return;

        const senderId = msg.senderId || msg.email || msg.senderName || 'guest';
        const senderName = msg.senderName || msg.sender || 'Customer';
        const userRole = msg.userRole || 'User';

        setConversations((prev) => {
          const existingIndex = prev.findIndex((c) => c.id === senderId);
          if (existingIndex > -1) {
            const updated = [...prev];
            const currentMsgs = updated[existingIndex].messages;
            // Prevent duplicate message entry
            if (!currentMsgs.some(m => m.id === msg.id && m.id !== undefined)) {
              updated[existingIndex] = {
                ...updated[existingIndex],
                messages: [...currentMsgs, msg],
                lastMessage: msg.text || msg.message,
                lastTime: msg.timestamp || new Date(),
              };
            }
            return updated;
          } else {
            return [
              ...prev,
              {
                id: senderId,
                name: senderName,
                email: msg.email || '',
                role: userRole,
                messages: [msg],
                lastMessage: msg.text || msg.message,
                lastTime: msg.timestamp || new Date(),
              },
            ];
          }
        });

        // Auto select first incoming conversation if none active
        setActiveConvId((prevId) => prevId || senderId);
      };

      socket.on('receive_message', handleReceiveMessage);

      return () => {
        socket.off('receive_message', handleReceiveMessage);
      };
    }
  }, [socket, user]);

  const handleSendResponse = (e) => {
    e.preventDefault();
    if (!input.trim() || !user || !activeConversation) return;

    const responseMsg = {
      id: Date.now(),
      sender: `${user.name} (Admin)`,
      senderId: user.id,
      senderName: `${user.name} (Admin)`,
      userRole: 'ADMIN',
      recipientId: activeConversation.id,
      text: input.trim(),
      timestamp: new Date(),
    };

    // Update conversation locally
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? {
              ...c,
              messages: [...c.messages, responseMsg],
              lastMessage: responseMsg.text,
              lastTime: responseMsg.timestamp,
            }
          : c
      )
    );

    setInput('');

    // Emit via Socket to the recipient's room
    if (socket) {
      socket.emit('send_message', responseMsg);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Just now';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Title Header */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Customer & Staff Messages Hub</span>
              <span className="bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" /> Direct Support
              </span>
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              View messages from users and staff. Respond directly — your reply will display on the user's Contact & Chat pages in real-time.
            </p>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 240px)' }}>
          {/* Left List of Conversations */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex flex-col overflow-hidden">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
              <Inbox className="w-4 h-4 text-orange-500" />
              <span>Inbox ({conversations.length})</span>
            </h2>

            {conversations.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-400">
                <MessageSquare className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" />
                <p className="font-bold text-sm text-gray-600 dark:text-gray-300">No Messages Yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Incoming contact messages from users and staff will appear here live.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                      activeConvId === conv.id
                        ? 'bg-slate-900 dark:bg-orange-600 text-white border-slate-900 shadow-md'
                        : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-orange-50 dark:hover:bg-gray-700 border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs truncate max-w-[140px]">
                        {conv.name}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          activeConvId === conv.id
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {conv.role}
                      </span>
                    </div>
                    {conv.lastMessage && (
                      <p className={`text-xs truncate ${activeConvId === conv.id ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                        {conv.lastMessage}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Message Thread & Reply Input */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
            {activeConversation ? (
              <>
                {/* Header */}
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-slate-900 via-gray-900 to-slate-800 text-white rounded-t-3xl">
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-500 text-white p-2.5 rounded-2xl shadow-md">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="font-bold text-white text-lg">{activeConversation.name}</h2>
                      <p className="text-xs text-gray-300">
                        {activeConversation.role} {activeConversation.email ? `• ${activeConversation.email}` : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/60 dark:bg-gray-900/60">
                  {activeConversation.messages.map((msg, index) => {
                    const isAdmin = msg.senderRole === 'ADMIN' || msg.userRole === 'ADMIN' || msg.sender?.includes('Admin');

                    return (
                      <div key={msg.id || index} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xl ${isAdmin ? 'max-w-md' : ''}`}>
                          <div className={`flex items-center space-x-2 mb-1 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                              {msg.senderName || msg.sender || (isAdmin ? 'Admin Support' : activeConversation.name)}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatTime(msg.timestamp || new Date())}</span>
                            </span>
                          </div>

                          <div
                            className={`p-4 rounded-2xl text-sm shadow-sm whitespace-pre-wrap ${
                              isAdmin
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
                  <div ref={messagesEndRef} />
                </div>

                {/* Form */}
                <form onSubmit={handleSendResponse} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center space-x-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Type response to ${activeConversation.name}...`}
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
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                <Inbox className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="font-bold text-lg text-gray-700 dark:text-gray-300">Select a Conversation</h3>
                <p className="text-xs text-gray-500 max-w-sm mt-1">
                  Choose a user or staff message from the list on the left to view the thread and send direct responses.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

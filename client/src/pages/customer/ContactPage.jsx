import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Send, Utensils, MessageSquare, CheckCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { useLanguage } from '../../context/LanguageContext';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

export default function ContactPage() {
  const { t } = useLanguage();
  const socket = useSocket();
  const { user } = useAuth();
  const { supportPhone, supportEmail } = useSettings();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    if (socket && user) {
      socket.emit('join_user_room', user.id);

      const handleReceive = (data) => {
        setResponses((prev) => [...prev, data]);
      };

      socket.on('receive_message', handleReceive);
      return () => {
        socket.off('receive_message', handleReceive);
      };
    }
  }, [socket, user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.message.trim()) return;

    const payload = {
      id: Date.now(),
      sender: user?.name || formData.name,
      senderId: user?.id || formData.email,
      senderName: formData.name,
      email: formData.email,
      text: formData.message,
      userRole: user?.role || 'Customer',
      timestamp: new Date(),
    };

    if (socket) {
      socket.emit('send_message', payload);
    }

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({ name: formData.name, email: formData.email, message: '' });
  };

  return (
    <div className="app-page-warm font-sans flex flex-col justify-between">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;0,9..144,900;1,9..144,600&family=Work+Sans:wght@400;500;600;700;800&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        .font-body { font-family: 'Work Sans', sans-serif; }
      `}</style>

      <div>
        <Navbar />

        {/* --- MAIN CONTACT CONTENT SECTION --- */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          
          {/* Header Title */}
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl sm:text-5xl font-black text-orange-600 tracking-tight">
              {t('getInTouch')}
            </h1>
            <div className="w-16 h-1 bg-orange-600 mx-auto mt-3 rounded-full"></div>
          </div>

          {/* Top 3 Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            
            {/* Card 1: Call Us */}
            <div className="bg-white rounded-3xl p-8 shadow-md border border-orange-100 flex items-center space-x-5 hover:shadow-xl transition-all">
              <div className="w-16 h-16 rounded-2xl bg-orange-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-600/30">
                <Phone className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-1">Call us</h3>
                <p className="text-gray-900 font-display font-bold text-lg">{supportPhone || '+251 900 000 000'}</p>
              </div>
            </div>

            {/* Card 2: Mail Us */}
            <div className="bg-white rounded-3xl p-8 shadow-md border border-orange-100 flex items-center space-x-5 hover:shadow-xl transition-all">
              <div className="w-16 h-16 rounded-2xl bg-orange-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-600/30">
                <Mail className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-1">Mail us</h3>
                <p className="text-gray-900 font-display font-bold text-base sm:text-lg break-all">{supportEmail || 'support@maed.com'}</p>
              </div>
            </div>

            {/* Card 3: Find Us */}
            <div className="bg-white rounded-3xl p-8 shadow-md border border-orange-100 flex items-center space-x-5 hover:shadow-xl transition-all">
              <div className="w-16 h-16 rounded-2xl bg-orange-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-600/30">
                <MapPin className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-1">Find us</h3>
                <p className="text-gray-900 font-display font-bold text-sm sm:text-base">Adama, Ethiopia</p>
              </div>
            </div>

          </div>

          {/* Form & Illustration Section */}
          <div className="bg-white rounded-3xl shadow-xl border border-orange-100 p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Input Form */}
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-gray-900 mb-1">Type here</h2>
                <p className="text-sm text-gray-500">Send us a message and our support team will reply promptly.</p>
              </div>

              {submitted && (
                <div className="bg-green-50 text-green-700 text-sm font-semibold p-4 rounded-xl border border-green-200">
                  Thank you! Your message has been successfully sent.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Your Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Message</label>
                  <textarea 
                    rows="5"
                    required
                    placeholder="Type your message here"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-orange-600/20 transition text-sm flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit</span>
                </button>
              </form>

              {/* Admin Responses Panel */}
              {responses.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                    <MessageSquare className="w-4 h-4 text-orange-600" />
                    <span>Responses from Support Team ({responses.length})</span>
                  </h3>
                  <div className="space-y-3">
                    {responses.map((resp, idx) => (
                      <div key={idx} className="bg-orange-50/80 border border-orange-200 p-4 rounded-2xl">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-orange-900">
                            {resp.senderName || resp.sender || 'Admin Support'}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {new Date(resp.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 font-medium">{resp.text || resp.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Support Illustration Image */}
            <div className="flex justify-center bg-orange-50/50 p-8 rounded-2xl border border-orange-100">
              <img 
                src="/m8.jpg" 
                alt="Support Customer Representative" 
                className="w-full max-w-md h-[380px] object-cover rounded-2xl shadow-md"
              />
            </div>

          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {new Date().getFullYear()} ማእድ Ma'ad Restaurant Management System. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
            <Link to="/about" className="hover:text-orange-500 transition-colors">About Us</Link>
            <Link to="/categories" className="hover:text-orange-500 transition-colors">Categories</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
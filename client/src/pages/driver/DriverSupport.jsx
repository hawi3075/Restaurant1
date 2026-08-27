import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import API from '../../services/api';
import showToast from '../../components/Toast';
import { HelpCircle, Send, Loader, Mail, MessageSquare, Phone, LifeBuoy, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function DriverSupport() {
  const { user } = useAuth();
  const { supportPhone, supportEmail } = useSettings();
  const [loading, setLoading] = useState(false);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({
    subject: '',
    category: 'TECHNICAL',
    message: '',
  });

  // Fetch user's submitted tickets and admin replies on load
  useEffect(() => {
    fetchUserTickets();
  }, [user]);

  const fetchUserTickets = async () => {
    if (!user?.id) return;
    try {
      setTicketsLoading(true);
      const res = await API.get(`/support-tickets/user/${user.id}`);
      setTickets(res.data || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject || !formData.message) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      setLoading(true);

      await API.post('/support-tickets', {
        userId: user.id,
        subject: formData.subject,
        category: formData.category,
        message: formData.message,
      });

      showToast('Support ticket submitted successfully! We will get back to you soon.', 'success');

      // Reset form & reload tickets list
      setFormData({
        subject: '',
        category: 'TECHNICAL',
        message: '',
      });
      fetchUserTickets();
    } catch (err) {
      console.error('Error submitting support ticket:', err);
      showToast('Failed to submit support ticket', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Top Navigation Bar - Centered & Stylish */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-orange-500 to-amber-500 p-2.5 rounded-xl shadow-md shadow-orange-500/20 text-white">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">Support & Help Center</h1>
              <p className="text-xs text-gray-500 font-medium">We are here to help you 24/7 with any issues</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-50 to-amber-50 px-3.5 py-2 rounded-xl border border-orange-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="text-xs font-bold text-orange-700">Online Assistance</span>
          </div>
        </div>
      </header>

      <div className="px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Contact Information & FAQs */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h3 className="text-base font-black text-gray-900 mb-3">Quick Contact</h3>
                <div className="space-y-2.5">
                  <a
                    href={`mailto:${supportEmail || 'support@maed.com'}`}
                    className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-all border border-orange-200"
                  >
                    <Mail className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-xs font-bold text-gray-600">Email Support</p>
                      <p className="text-xs text-orange-600 font-medium">{supportEmail || 'support@maed.com'}</p>
                    </div>
                  </a>

                  <a
                    href={`tel:${supportPhone || '+251900000000'}`}
                    className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-all border border-orange-200"
                  >
                    <Phone className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-xs font-bold text-gray-600">Phone Support</p>
                      <p className="text-xs text-orange-600 font-medium">{supportPhone || '+251 900 000 000'}</p>
                    </div>
                  </a>

                  <Link to="/driver/chat" className="w-full flex items-center space-x-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-all border border-orange-200">
                    <MessageSquare className="w-5 h-5 text-orange-600" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-gray-600">Live Chat</p>
                      <p className="text-xs text-orange-600 font-medium">Start chatting with AI Assistant</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* FAQs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h3 className="text-base font-black text-gray-900 mb-3">Common Questions</h3>
                <div className="space-y-2">
                  <div className="p-2.5 bg-gray-50 rounded-lg">
                    <p className="text-xs font-bold text-gray-900">How do I update order status?</p>
                    <p className="text-xs text-gray-500 mt-0.5">Go to Orders section and click on the order.</p>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-lg">
                    <p className="text-xs font-bold text-gray-900">How to contact admin directly?</p>
                    <p className="text-xs text-gray-500 mt-0.5">Submit a ticket using the form on the right.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Ticket Form & Ticket History with Admin Replies */}
            <div className="lg:col-span-2 space-y-6">
              {/* Support Ticket Form */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center space-x-3 mb-5">
                  <div className="bg-orange-100 p-2.5 rounded-lg">
                    <HelpCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <h2 className="text-lg font-black text-gray-900">Submit a Support Ticket</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-sm font-medium"
                      required
                    >
                      <option value="TECHNICAL">Technical Issue</option>
                      <option value="ORDERS">Order Management</option>
                      <option value="ACCOUNT">Account & Profile</option>
                      <option value="PAYMENT">Payment & Billing</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Brief description of your issue"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-sm font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Describe your issue or question in detail..."
                      rows="4"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-sm font-medium resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white py-3 rounded-lg font-black text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Submit Ticket</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* My Tickets & Admin Responses Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-black text-gray-900 mb-4">Your Tickets & Admin Responses</h3>

                {ticketsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader className="w-6 h-6 animate-spin text-orange-500" />
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-gray-600">No support tickets found</p>
                    <p className="text-xs text-gray-400 mt-1">Submitted inquiries and admin replies will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                    {tickets.map((ticket) => (
                      <div key={ticket._id || ticket.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-3">
                        {/* Ticket Header */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2.5 py-1 rounded-md">
                            {ticket.category}
                          </span>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 ${
                            ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {ticket.status === 'RESOLVED' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                            {ticket.status || 'PENDING'}
                          </span>
                        </div>

                        {/* Subject & Message */}
                        <div>
                          <h4 className="text-sm font-black text-gray-900">{ticket.subject}</h4>
                          <p className="text-xs text-gray-600 mt-1">{ticket.message}</p>
                          <span className="text-[10px] text-gray-400 mt-1 block">
                            Submitted: {new Date(ticket.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {/* Admin Reply Box (if available) */}
                        {ticket.adminReply ? (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="w-2 h-2 rounded-full bg-orange-600"></span>
                              <p className="text-xs font-black text-orange-900">Admin Response</p>
                            </div>
                            <p className="text-xs text-gray-800 font-medium">{ticket.adminReply}</p>
                            {ticket.updatedAt && (
                              <span className="text-[10px] text-orange-500/80 mt-1 block">
                                Replied: {new Date(ticket.updatedAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="bg-gray-100 rounded-lg p-2 text-center">
                            <p className="text-[11px] text-gray-500 italic">Waiting for admin response...</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import API from '../../services/api';
import showToast from '../../components/Toast';
import DashboardHeader from '../../components/DashboardHeader';
import { HelpCircle, Send, Loader, Mail, MessageSquare, Phone, CheckCircle, X, Clock, AlertCircle, MessageCircle } from 'lucide-react';

export default function ChefSupport() {
  const { user } = useAuth();
  const { supportPhone, supportEmail } = useSettings();
  const [loading, setLoading] = useState(false);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({
    subject: '',
    category: 'TECHNICAL',
    message: '',
  });

  // Fetch existing tickets for this user
  const fetchTickets = async () => {
    try {
      setTicketsLoading(true);
      const response = await API.get(`/support-tickets/user/${user.id}`);
      setTickets(response.data);
    } catch (err) {
      console.error('Error fetching support tickets:', err);
    } finally {
      setTicketsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchTickets();
    }
  }, [user?.id]);

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

      showToast('Support ticket submitted successfully!', 'success');
      setSubmitted(true);

      // Reset form & refresh tickets list
      setFormData({
        subject: '',
        category: 'TECHNICAL',
        message: '',
      });
      fetchTickets();
    } catch (err) {
      console.error('Error submitting support ticket:', err);
      showToast('Failed to submit support ticket', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">

      {/* Page Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-950">Support & Help 🆘</h1>
              <p className="text-gray-600 mt-1">Get help with any issues or questions</p>
            </div>
            <div className="flex items-center space-x-2 bg-orange-50 px-4 py-2 rounded-xl border border-orange-200">
              <HelpCircle className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-bold text-orange-700">24/7 Support</span>
            </div>
          </div>
        </div>
      </header>

      <div className="px-8 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Contacts */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-black text-gray-900 mb-4">Quick Contact</h3>
                <div className="space-y-4">
                  <a
                    href={`mailto:${supportEmail || 'support@maed.com'}`}
                    className="flex items-center space-x-3 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all border border-orange-200"
                  >
                    <Mail className="w-6 h-6 text-orange-600" />
                    <div>
                      <p className="text-xs font-bold text-gray-700">Email Support</p>
                      <p className="text-sm text-orange-600 font-medium">{supportEmail || 'support@maed.com'}</p>
                    </div>
                  </a>

                  <a
                    href={`tel:${supportPhone || '+251900000000'}`}
                    className="flex items-center space-x-3 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all border border-orange-200"
                  >
                    <Phone className="w-6 h-6 text-orange-600" />
                    <div>
                      <p className="text-xs font-bold text-gray-700">Phone Support</p>
                      <p className="text-sm text-orange-600 font-medium">{supportPhone || '+251 900 000 000'}</p>
                    </div>
                  </a>

                  <Link to="/chef/chat" className="w-full flex items-center space-x-3 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all border border-orange-200">
                    <MessageSquare className="w-6 h-6 text-orange-600" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-gray-700">Live Chat</p>
                      <p className="text-sm text-orange-600 font-medium">Start chatting with AI Assistant</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* FAQs */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-black text-gray-900 mb-4">Common Questions</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-bold text-gray-900">How do I update order status?</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Go to Orders section and click on the order to update its status.
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-bold text-gray-900">How to add new food items?</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Use "Add New Food" section. Items require admin approval.
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-bold text-gray-900">How to edit my profile?</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Navigate to Profile section to update your information.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Ticket Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-orange-100 p-3 rounded-xl">
                    <HelpCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">Submit a Support Ticket</h2>
                </div>

                {/* Success Banner */}
                {submitted && (
                  <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-5 shadow-md flex items-start space-x-4">
                    <div className="bg-white/20 p-2.5 rounded-lg flex-shrink-0">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-base">Ticket Submitted!</h3>
                      <p className="text-sm opacity-90 mt-0.5">
                        Thanks for reaching out. Our support team typically responds within 24 hours —
                        we'll notify you by email once we've replied.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="text-white/80 hover:text-white flex-shrink-0"
                      aria-label="Dismiss"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none font-medium"
                      required
                    >
                      <option value="TECHNICAL">Technical Issue</option>
                      <option value="ORDERS">Order Management</option>
                      <option value="ACCOUNT">Account & Profile</option>
                      <option value="FOOD_ITEMS">Food Items & Menu</option>
                      <option value="PAYMENT">Payment & Billing</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Brief description of your issue"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Describe your issue or question in detail..."
                      rows="6"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none font-medium resize-none"
                      required
                    />
                  </div>

                  {/* User Info Display */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p className="text-xs font-bold text-gray-700 mb-2">Your Information:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <span className="font-bold text-gray-900 ml-2">{user?.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <span className="font-bold text-gray-900 ml-2">{user?.email}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white py-4 rounded-xl font-black text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-6 h-6 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-6 h-6" />
                        <span>Submit Ticket</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Admin Response / Ticket History Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center space-x-2">
              <span>💬 Your Submitted Tickets & Admin Responses</span>
            </h2>

            {ticketsLoading ? (
              <div className="flex justify-center py-10">
                <Loader className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-600 font-bold">No support tickets found</p>
                <p className="text-xs text-gray-400 mt-1">Submit a ticket above if you need any assistance.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="border border-gray-200 rounded-2xl p-6 bg-gray-50/50 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
                      <div>
                        <span className="text-xs font-bold px-2.5 py-1 bg-orange-100 text-orange-700 rounded-lg mr-2">
                          {ticket.category}
                        </span>
                        <span className="font-black text-gray-900 text-base">{ticket.subject}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${
                        ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                        ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {ticket.status || 'PENDING'}
                      </span>
                    </div>

                    {/* Original Message */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-1">Your Message:</p>
                      <p className="text-sm text-gray-800 bg-white p-3.5 rounded-xl border border-gray-200">
                        {ticket.message}
                      </p>
                    </div>

                    {/* Admin Response Block */}
                    {ticket.adminResponse ? (
                      <div className="bg-orange-50/80 border border-orange-200 p-4 rounded-xl space-y-1 mt-2">
                        <div className="flex items-center space-x-2 text-orange-800 font-bold text-xs">
                          <MessageCircle className="w-4 h-4 text-orange-600" />
                          <span>Admin Support Response:</span>
                        </div>
                        <p className="text-sm text-gray-900 font-medium pl-6">
                          {ticket.adminResponse}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-400 text-xs italic pt-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Awaiting admin response...</span>
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
  );
}
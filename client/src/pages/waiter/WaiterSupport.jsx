import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import API from '../../services/api';
import showToast from '../../components/Toast';
import { HelpCircle, Send, Loader, Mail, MessageSquare, Phone } from 'lucide-react';

export default function WaiterSupport() {
  const { user } = useAuth();
  const { supportPhone, supportEmail } = useSettings();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    category: 'TECHNICAL',
    message: '',
  });

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

      setFormData({
        subject: '',
        category: 'TECHNICAL',
        message: '',
      });
    } catch (err) {
      console.error('Error submitting support ticket:', err);
      showToast('Failed to submit support ticket', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
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

                  <Link
                    to="/waiter/chat"
                    className="w-full flex items-center space-x-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-all border border-orange-200"
                  >
                    <MessageSquare className="w-5 h-5 text-orange-600" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-gray-600">Live Chat</p>
                      <p className="text-xs text-orange-600 font-medium">Start chatting with AI Assistant</p>
                    </div>
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h3 className="text-base font-black text-gray-900 mb-3">Common Questions</h3>
                <div className="space-y-2">
                  <div className="p-2.5 bg-gray-50 rounded-lg">
                    <p className="text-xs font-bold text-gray-900">How do I update order status?</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Go to Orders section and click on the order to update its status.
                    </p>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-lg">
                    <p className="text-xs font-bold text-gray-900">How to add new food items?</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Use "Add New Food" section. Items require admin approval.
                    </p>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-lg">
                    <p className="text-xs font-bold text-gray-900">How to edit my profile?</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Navigate to Profile section to update your information.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
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
                      <option value="FOOD_ITEMS">Food Items & Menu</option>
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
                      rows="6"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-sm font-medium resize-none"
                      required
                    />
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-xs font-bold text-gray-600 mb-1.5">Your Information:</p>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <div>
                        <span className="text-gray-500">Name:</span>
                        <span className="font-bold text-gray-900 ml-1.5">{user?.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <span className="font-bold text-gray-900 ml-1.5">{user?.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Role:</span>
                        <span className="font-bold text-gray-900 ml-1.5">{user?.role}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Restaurant:</span>
                        <span className="font-bold text-gray-900 ml-1.5">
                          {user?.restaurant?.name || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white py-3 rounded-lg font-black text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
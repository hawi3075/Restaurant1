import React, { useState } from 'react';
import { X, Star, Upload, Loader } from 'lucide-react';
import API from '../services/api';

export default function ReviewModal({ isOpen, onClose, order, onSuccess }) {
  const [selectedFood, setSelectedFood] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFood) {
      alert('Please select a food item to review');
      return;
    }

    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);

      await API.post('/reviews', {
        foodId: selectedFood.foodId,
        rating,
        comment,
        image: imagePreview, // In production, upload to cloud storage
      });

      // Reset form
      setSelectedFood(null);
      setRating(0);
      setComment('');
      setImage(null);
      setImagePreview(null);

      if (onSuccess) {
        onSuccess();
      }

      alert('Review submitted successfully!');
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Leave a Review</h2>
            <p className="text-sm text-gray-500 mt-1">
              Order #{order.id.slice(0, 8)} • How was your experience?
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Select Food Item */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Select Item to Review
            </label>
            <div className="grid grid-cols-1 gap-3">
              {order.items?.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedFood(item)}
                  className={`p-4 rounded-xl border-2 transition text-left ${
                    selectedFood?.id === item.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🍽️</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{item.food?.name}</p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity} • ${item.unitPrice.toFixed(2)}
                      </p>
                    </div>
                    {selectedFood?.id === item.id && (
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Your Rating
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-3 text-sm font-bold text-gray-700">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Your Review (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with others..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Add Photo (Optional)
            </label>
            {imagePreview ? (
              <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={imagePreview}
                  alt="Review"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="block w-full h-32 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-500 transition cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="h-full flex flex-col items-center justify-center text-gray-500 hover:text-orange-600">
                  <Upload className="w-8 h-8 mb-2" />
                  <p className="text-sm font-medium">Click to upload photo</p>
                  <p className="text-xs mt-1">PNG, JPG up to 10MB</p>
                </div>
              </label>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 rounded-xl border-2 border-gray-200 font-bold text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedFood || rating === 0}
              className="flex-1 py-3 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Review</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Star, MessageSquare, Search, Trash2 } from 'lucide-react';
import API from '../../services/api';

export default function AdminReviewsPage() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const res = await API.get('/foods');
      const withReviews = (res.data || [])
        .map((food) => ({
          ...food,
          avgRating: calculateRating(food.reviews),
          reviewCount: food.reviews?.length || 0,
        }))
        .filter((food) => food.reviewCount > 0)
        .sort((a, b) => b.reviewCount - a.reviewCount);
      setFoods(withReviews);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await API.delete(`/reviews/${reviewId}`);
      fetchFoods();
    } catch (err) {
      console.error('Error deleting review:', err);
      alert(err.response?.data?.error || 'Failed to delete review');
    }
  };

  const filteredFoods = foods.filter(
    (food) =>
      food.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.restaurant?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-24">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Reviews & Ratings</h1>
          <p className="text-gray-600 mt-1">Browse customer reviews across all foods & delete inappropriate reviews</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search food or restaurant..."
            className="pl-9 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-sm font-medium w-64"
          />
        </div>
      </div>

      {filteredFoods.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Reviews Found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'No foods match your search' : 'Reviews will appear here once customers rate foods'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFoods.map((food) => (
            <div
              key={food.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    {food.image && (
                      <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900">{food.name}</h3>
                    <p className="text-xs text-gray-500">{food.restaurant?.name || 'Unknown restaurant'}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < Math.round(food.avgRating)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-gray-500 ml-1">
                        {food.avgRating.toFixed(1)} ({food.reviewCount} {food.reviewCount === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-2 pt-3 border-t border-gray-100">
                {food.reviews?.map((review, idx) => (
                  <div key={review.id || idx} className="bg-gray-50 rounded-xl p-3.5 flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-bold text-gray-900">
                          {review.customer?.name || review.user?.name || 'Customer'}
                        </span>
                        <div className="flex items-center space-x-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-xs text-gray-700">{review.comment}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                      title="Delete Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
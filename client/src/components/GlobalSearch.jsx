import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, TrendingUp, Clock, Utensils, Store } from 'lucide-react';
import API from '../services/api';

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    restaurants: [],
    foods: [],
    categories: [],
  });
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Search with debounce
  useEffect(() => {
    if (query.length < 2) {
      setResults({ restaurants: [], foods: [], categories: [] });
      return;
    }

    const timer = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async () => {
    try {
      setLoading(true);
      
      // Parallel API calls for better performance
      const [restaurantsRes, foodsRes, categoriesRes] = await Promise.all([
        API.get('/restaurants'),
        API.get('/foods'),
        API.get('/categories'),
      ]);

      // Filter results based on query
      const restaurants = restaurantsRes.data.filter((r) =>
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        r.address?.toLowerCase().includes(query.toLowerCase()) ||
        r.cuisine?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3);

      const foods = foodsRes.data.filter((f) =>
        f.name.toLowerCase().includes(query.toLowerCase()) ||
        f.description?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);

      const categories = categoriesRes.data.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3);

      setResults({ restaurants, foods, categories });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveRecentSearch = (searchQuery) => {
    const updated = [
      searchQuery,
      ...recentSearches.filter((s) => s !== searchQuery),
    ].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleResultClick = (type, id, name) => {
    saveRecentSearch(name);
    setIsOpen(false);
    setQuery('');

    if (type === 'restaurant') {
      navigate(`/restaurants/${id}`);
    } else if (type === 'food') {
      navigate(`/foods/${id}`);
    } else if (type === 'category') {
      navigate(`/categories/${id}`);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const totalResults = results.restaurants.length + results.foods.length + results.categories.length;

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition text-gray-700"
      >
        <Search className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:inline">Search...</span>
        <kbd className="hidden lg:inline-block px-2 py-0.5 text-xs font-semibold bg-white border border-gray-300 rounded">
          ⌘K
        </kbd>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)} />

          {/* Modal */}
          <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white rounded-3xl shadow-2xl z-50 max-h-[600px] flex flex-col border border-gray-200">
            {/* Search Input */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search restaurants, foods, categories..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-gray-900 placeholder-gray-500"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
                </div>
              ) : query.length < 2 ? (
                <div>
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>Recent Searches</span>
                        </h3>
                        <button
                          onClick={clearRecentSearches}
                          className="text-xs text-gray-500 hover:text-orange-600 font-medium"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="space-y-2">
                        {recentSearches.map((search, idx) => (
                          <button
                            key={idx}
                            onClick={() => setQuery(search)}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-700 transition"
                          >
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Searches */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <span>Popular Searches</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {['Pizza', 'Burger', 'Ethiopian Food', 'Fast Food', 'Dessert'].map((term) => (
                        <button
                          key={term}
                          onClick={() => setQuery(term)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-orange-600 rounded-full text-xs font-medium transition"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : totalResults === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-lg font-bold text-gray-700 mb-2">No Results Found</h3>
                  <p className="text-sm text-gray-500">
                    Try searching with different keywords
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Restaurants */}
                  {results.restaurants.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center space-x-2">
                        <Store className="w-4 h-4" />
                        <span>Restaurants ({results.restaurants.length})</span>
                      </h3>
                      <div className="space-y-2">
                        {results.restaurants.map((restaurant) => (
                          <button
                            key={restaurant.id}
                            onClick={() =>
                              handleResultClick('restaurant', restaurant.id, restaurant.name)
                            }
                            className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100 transition text-left"
                          >
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Store className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 text-sm truncate">
                                {restaurant.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {restaurant.address || 'No address'}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Foods */}
                  {results.foods.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center space-x-2">
                        <Utensils className="w-4 h-4" />
                        <span>Foods ({results.foods.length})</span>
                      </h3>
                      <div className="space-y-2">
                        {results.foods.map((food) => (
                          <button
                            key={food.id}
                            onClick={() => handleResultClick('food', food.id, food.name)}
                            className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100 transition text-left"
                          >
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Utensils className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 text-sm truncate">
                                {food.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                ${food.price?.toFixed(2)} • {food.restaurant?.name}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Categories */}
                  {results.categories.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">
                        Categories ({results.categories.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {results.categories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() =>
                              handleResultClick('category', category.id, category.name)
                            }
                            className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-xl text-sm font-bold transition"
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-3xl">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Press ESC to close</span>
                {totalResults > 0 && (
                  <span className="font-medium">{totalResults} results found</span>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

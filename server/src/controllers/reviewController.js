const prisma = require('../config/prisma');

// Create a review (Customer only, after order completion)
const createReview = async (req, res) => {
  try {
    const { foodId, rating, comment, image } = req.body;
    const customerId = req.user.id;

    if (!foodId || !rating) {
      return res.status(400).json({ error: 'Please provide food ID and rating.' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }

    // Check if customer has ordered this food
    const hasOrdered = await prisma.orderItem.findFirst({
      where: {
        foodId,
        order: {
          customerId,
          status: { in: ['DELIVERED', 'SERVED', 'COMPLETED'] }
        }
      }
    });

    if (!hasOrdered) {
      return res.status(403).json({ error: 'You can only review food you have ordered.' });
    }

    const review = await prisma.review.create({
      data: {
        foodId,
        customerId,
        rating,
        comment,
        image,
      },
      include: {
        customer: { select: { name: true } },
        food: { select: { name: true } }
      }
    });

    // Update food rating average
    const allReviews = await prisma.review.findMany({ where: { foodId } });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await prisma.food.update({
      where: { id: foodId },
      data: { 
        restaurant: {
          update: {
            rating: avgRating // Update restaurant rating based on food ratings
          }
        }
      }
    });

    res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Internal server error while creating review.' });
  }
};

// Get reviews for a food item
const getReviewsByFood = async (req, res) => {
  try {
    const { foodId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { foodId },
      include: {
        customer: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Get all reviews (Admin)
const getAllReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        customer: { select: { name: true, email: true } },
        food: { select: { name: true }, include: { restaurant: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Delete a review (Admin only)
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.review.delete({ where: { id } });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { createReview, getReviewsByFood, getAllReviews, deleteReview };

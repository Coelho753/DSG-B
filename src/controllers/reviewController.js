const Review = require('../models/Review');
const Product = require('../models/Product');

const recalcRating = async (productId) => {
  const agg = await Review.aggregate([
    { $match: { productId } },
    { $group: { _id: '$productId', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const avg = agg[0]?.avg || 0;
  const count = agg[0]?.count || 0;
  await Product.findByIdAndUpdate(productId, { avaliacaoMedia: Number(avg.toFixed(2)), totalAvaliacoes: count });
};

const listReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ productId: req.params.id }).populate('userId', 'nome').sort({ createdAt: -1 });
    return res.json(reviews);
  } catch (error) {
    return next(error);
  }
};

const upsertReview = async (req, res, next) => {
  try {
    const rating = Number(req.body.rating ?? req.body.stars);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'rating deve ser entre 1 e 5' });
    }

    const comment = (req.body.comment || req.body.message || '').trim();
    const photoUrl = (req.body.photoUrl || req.body.photo || req.body.imageUrl || '').trim();

    const review = await Review.findOneAndUpdate(
      { productId: req.params.id, userId: req.user._id },
      { rating, comment, message: comment, photoUrl },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await recalcRating(review.productId);
    return res.status(201).json(review);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listReviews,
  upsertReview,
};

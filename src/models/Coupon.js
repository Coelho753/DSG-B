const CouponSchema = new mongoose.Schema({

  code: String,

  discount: Number,

  active: Boolean,

  expiresAt: Date

});
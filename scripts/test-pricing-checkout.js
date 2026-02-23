const assert = require('assert');
const { calculateFinalPrice } = require('../src/services/pricingService');
const { calculateShipping } = require('../src/services/shippingService');

const run = () => {
  const discounted = calculateFinalPrice(100, 20);
  assert.strictEqual(discounted, 80);

  const freeShipping = calculateShipping(149);
  assert.strictEqual(freeShipping, 0);

  const paidShipping = calculateShipping(148.99);
  assert.strictEqual(paidShipping, 19.9);

  console.log('pricing and shipping checks passed');
};

run();

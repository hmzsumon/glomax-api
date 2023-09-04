const PxcPrice = require('../models/pxc_price');

const getCurrentPrice = async () => {
  try {
    const currentPrice = await PxcPrice.find().sort({ _id: -1 }).limit(1);
    // console.log(currentPrice[0].price);
    return currentPrice[0].price;
  } catch (error) {
    console.log(error);
  }
};

module.exports = getCurrentPrice;

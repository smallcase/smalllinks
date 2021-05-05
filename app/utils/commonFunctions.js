module.exports = {
  getExpiryDate(ttl) {
    let expiry = ttl;
    if (ttl === undefined) {
      expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 2);
    } else {
      expiry = new Date(`${ttl}`);
    }
    return expiry;
  },
};

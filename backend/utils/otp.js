const crypto = require("crypto");

const MAX_OTP_ATTEMPTS = 5;

const makeOtp = () => ({
  code: crypto.randomInt(100000, 1000000).toString(),
  expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  attempts: 0,
});

const codesMatch = (saved, entered) => {
  if (typeof saved !== "string" || typeof entered !== "string" || saved.length !== entered.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(saved), Buffer.from(entered));
};

module.exports = { MAX_OTP_ATTEMPTS, makeOtp, codesMatch };
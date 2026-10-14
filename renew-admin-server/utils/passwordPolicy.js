// Any character that is not a letter, a digit, or a space counts as special
const SPECIAL = /[^A-Za-z0-9\s]/;

function checkPassword(password) {
  const pw = String(password || '');
  if (pw.length < 8) return 'Password must be at least 8 characters';
  if (pw.length > 72) return 'Password must be 72 characters or fewer';
  if (!SPECIAL.test(pw)) {
    return 'Password must include at least one special character (for example ! @ # $ % &)';
  }
  return null; // null means the password is acceptable
}

module.exports = { checkPassword };
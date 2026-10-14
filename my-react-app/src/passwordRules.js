const SPECIAL = /[^A-Za-z0-9\s]/;

export const PASSWORD_HINT = "At least 8 characters, including one special character (! @ # $ % &)";

export function passwordProblem(password) {
  const pw = String(password || "");
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (pw.length > 72) return "Password must be 72 characters or fewer.";
  if (!SPECIAL.test(pw)) return "Password must include at least one special character (for example ! @ # $ % &).";
  return "";
}
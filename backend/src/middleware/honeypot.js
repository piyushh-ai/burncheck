// src/middleware/honeypot.js
// Honeypot spam protection — a hidden field that bots fill, humans don't.
// If the `_hp` field is present and non-empty → it's a bot → reject silently.
// Frontend form must include: <input type="text" name="_hp" style="display:none" tabindex="-1" autocomplete="off" />

export function honeypotCheck(req, res, next) {
  const honeypot = req.body._hp;

  // Bot filled the hidden field — reject silently with a fake success
  // (don't tell bots they've been caught)
  if (honeypot && honeypot.trim() !== "") {
    console.log("[honeypot] Bot detected, rejecting silently");
    return res.status(200).json({
      success: true,
      recommendations: [],
      summary: "No recommendations found for your profile.",
    });
  }

  next();
}

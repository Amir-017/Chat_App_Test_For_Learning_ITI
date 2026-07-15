const { clerkMiddleware, getAuth, clerkClient, verifyToken } = require("@clerk/express");
const User = require("../models/users.models");

// Finds the local Mongo user linked to a Clerk account, creating it from the Clerk profile on first sight
const getOrCreateLocalUser = async (clerkId) => {
  const existing = await User.findOne({ clerkId });
  if (existing) {
    if (!existing.imageUrl) {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      existing.imageUrl = clerkUser.imageUrl || null;
      await existing.save();
    }
    return existing;
  }

  const clerkUser = await clerkClient.users.getUser(clerkId);
  const email = clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress;
  const name = clerkUser.fullName || clerkUser.username || email || "User";
  const imageUrl = clerkUser.imageUrl || null;

  // Clerk guarantees emails are unique among active accounts, so a local record with this
  // email and a different clerkId can only be left over from a previously deleted Clerk
  // account (email unique index would otherwise reject the create below). Re-link it to the
  // new account instead of failing, so signing up again with the same email doesn't 500.
  const relinked = email
    ? await User.findOneAndUpdate({ email }, { clerkId, name, imageUrl }, { new: true })
    : null;
  if (relinked) return relinked;

  return User.create({ clerkId, name, email, imageUrl });
};

// Reads the Clerk identity clerkMiddleware() attached to the request, rejects unauthenticated requests with plain JSON
// (requireAuth() from @clerk/express redirects instead, which doesn't suit a JSON API), and otherwise resolves the
// caller to a local user, exposing it as req.user.id (a Mongo id) so the rest of the app is unchanged
const auth = async (req, res, next) => {
  try {
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await getOrCreateLocalUser(clerkId);
    req.user = { id: String(user._id), clerkId };
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verifies a Clerk session token outside of Express (used for the Socket.IO handshake) and returns the Clerk user id, or null if invalid.
// verifyToken() resolves with the JWT payload directly on success and throws on failure (it does not return {data, errors}).
const verifySocketToken = async (token) => {
  try {
    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
    return payload.sub;
  } catch (error) {
    return null;
  }
};

module.exports = { clerkMiddleware, auth, getOrCreateLocalUser, verifySocketToken };

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

  return User.create({ clerkId, name, email, imageUrl: clerkUser.imageUrl || null });
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

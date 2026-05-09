const linkedinService = require("../services/linkedinService");
const { linkedin_token } = require("../models");
const crypto = require("crypto");

// Get LinkedIn auth URL
exports.getAuthUrl = async (req, res) => {
  try {
    const state = crypto.randomBytes(16).toString("hex");
    const stateData = Buffer.from(
      JSON.stringify({ userId: req.user.id, nonce: state })
    ).toString("base64");
    const url = linkedinService.getAuthorizationUrl(stateData);
    console.log(`[LinkedIn] Auth URL generated for user ${req.user.id}`);
    return res.json({ url, state: stateData });
  } catch (error) {
    console.error("[LinkedIn] Auth URL error:", error);
    return res.status(500).json({ error: "Failed to generate auth URL" });
  }
};

// Handle OAuth callback — LinkedIn redirects here (no auth middleware)
exports.callback = async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  try {
    const { code, state, error: oauthError, error_description } = req.query;

    console.log("[LinkedIn] Callback received:", {
      hasCode: !!code,
      hasState: !!state,
      error: oauthError || null,
    });

    // If LinkedIn returned an error (user denied, app not approved, etc.)
    if (oauthError) {
      console.error("[LinkedIn] OAuth error:", oauthError, error_description);
      return res.redirect(
        `${frontendUrl}/settings?linkedin=error&reason=${encodeURIComponent(
          error_description || oauthError
        )}`
      );
    }

    if (!code) {
      return res.redirect(
        `${frontendUrl}/settings?linkedin=error&reason=no_code`
      );
    }

    // Decode userId from state
    let userId;
    try {
      const decoded = Buffer.from(state, "base64").toString();
      console.log("[LinkedIn] Decoded state:", decoded);
      const stateData = JSON.parse(decoded);
      userId = stateData.userId;
    } catch (e) {
      console.error("[LinkedIn] State decode error:", e.message);
      return res.redirect(
        `${frontendUrl}/settings?linkedin=error&reason=invalid_state`
      );
    }

    if (!userId) {
      return res.redirect(
        `${frontendUrl}/settings?linkedin=error&reason=no_user`
      );
    }

    // Exchange code for access token
    console.log(`[LinkedIn] Exchanging code for user ${userId}...`);
    const tokenData = await linkedinService.exchangeCodeForToken(code);

    // Get profile to extract the person URN (sub = member ID)
    console.log("[LinkedIn] Fetching profile...");
    const profileData = await linkedinService.getProfile(tokenData.access_token);

    // Build the person URN from the `sub` claim
    const personId = profileData.sub
      ? `urn:li:person:${profileData.sub}`
      : null;

    if (!personId) {
      console.error("[LinkedIn] No 'sub' in profile data:", profileData);
      return res.redirect(
        `${frontendUrl}/settings?linkedin=error&reason=no_person_id`
      );
    }

    // Extract display name and picture from the OIDC profile
    const linkedinName = profileData.name || profileData.given_name || 'LinkedIn User';
    const linkedinPicture = profileData.picture || null;

    // Save / update token in DB
    await linkedin_token.upsert({
      fk_user: userId,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000),
      linkedin_person_id: personId,
      scope: tokenData.scope,
      linkedin_name: linkedinName,
      linkedin_picture: linkedinPicture,
    });

    console.log(`[LinkedIn] ✓ Connected for user ${userId}, personId: ${personId}`);
    return res.redirect(`${frontendUrl}/settings?linkedin=success`);
  } catch (error) {
    console.error("[LinkedIn] Callback error:", error.message);
    return res.redirect(
      `${frontendUrl}/settings?linkedin=error&reason=${encodeURIComponent(
        error.message || "token_exchange"
      )}`
    );
  }
};

// Check connection status
exports.status = async (req, res) => {
  try {
    const token = await linkedin_token.findOne({
      where: { fk_user: req.user.id },
    });

    if (!token) {
      return res.json({ connected: false });
    }

    const isExpired = new Date(token.expires_at) < new Date();

    // Lazy-load profile name/picture if missing (for tokens created before this feature)
    let name = token.linkedin_name || null;
    let picture = token.linkedin_picture || null;
    if (!isExpired && !name && token.access_token) {
      try {
        const profileData = await linkedinService.getProfile(token.access_token);
        name = profileData.name || profileData.given_name || null;
        picture = profileData.picture || null;
        if (name) {
          await token.update({ linkedin_name: name, linkedin_picture: picture });
        }
      } catch (e) {
        console.log("[LinkedIn] Could not lazy-load profile:", e.message);
      }
    }

    return res.json({
      connected: !isExpired,
      expiresAt: token.expires_at,
      personId: token.linkedin_person_id,
      expired: isExpired,
      name,
      picture,
    });
  } catch (error) {
    console.error("[LinkedIn] Status check error:", error.message);
    return res.status(500).json({ error: "Failed to check status" });
  }
};

// Publish post to LinkedIn
exports.publishJob = async (req, res) => {
  try {
    const { text, applyLink } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Post text is required" });
    }

    const token = await linkedin_token.findOne({
      where: { fk_user: req.user.id },
    });

    if (!token) {
      return res.status(401).json({
        error: "LinkedIn not connected. Please connect in Settings.",
      });
    }

    if (new Date(token.expires_at) < new Date()) {
      return res.status(401).json({
        error: "LinkedIn token expired. Please reconnect in Settings.",
      });
    }

    if (!token.linkedin_person_id) {
      return res.status(400).json({
        error: "LinkedIn person ID is missing. Please reconnect your account.",
      });
    }

    console.log(`[LinkedIn] Publishing for user ${req.user.id}...`);
    const result = await linkedinService.publishPost(
      token.access_token,
      token.linkedin_person_id,
      text,
      applyLink || null
    );

    console.log(`[LinkedIn] Post published ✓`);

    // Build a URL to view the post on LinkedIn
    // postId is usually an activity URN like "urn:li:share:12345" or "urn:li:ugcPost:12345"
    let postUrl = null;
    if (result.postId) {
      // Extract the numeric ID from the URN
      const numericId = result.postId.split(':').pop();
      if (numericId) {
        // The person URN sub is the member ID
        const memberId = token.linkedin_person_id ? token.linkedin_person_id.split(':').pop() : '';
        postUrl = `https://www.linkedin.com/feed/update/${result.postId}/`;
      }
    }

    return res.json({
      message: "Published to LinkedIn",
      result,
      postUrl,
      linkedinName: token.linkedin_name || null,
      linkedinPicture: token.linkedin_picture || null,
    });
  } catch (error) {
    console.error("[LinkedIn] Publish error:", error.message);
    return res.status(500).json({ error: error.message || "Failed to publish" });
  }
};

// Disconnect LinkedIn
exports.disconnect = async (req, res) => {
  try {
    await linkedin_token.destroy({ where: { fk_user: req.user.id } });
    console.log(`[LinkedIn] Disconnected for user ${req.user.id}`);
    return res.json({ message: "LinkedIn disconnected" });
  } catch (error) {
    console.error("[LinkedIn] Disconnect error:", error.message);
    return res.status(500).json({ error: "Failed to disconnect" });
  }
};

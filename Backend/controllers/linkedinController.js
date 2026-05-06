const linkedinService = require("../services/linkedinService");
const { linkedin_token, JobPosting, JobOffer, profile } = require("../models");
const crypto = require("crypto");

// Get LinkedIn auth URL
exports.getAuthUrl = async (req, res) => {
  try {
    const state = crypto.randomBytes(16).toString("hex");
    // Store state in session/temp — for simplicity we encode userId in it
    const stateData = Buffer.from(JSON.stringify({ userId: req.user.id, nonce: state })).toString("base64");
    const url = linkedinService.getAuthorizationUrl(stateData);
    return res.json({ url, state: stateData });
  } catch (error) {
    return res.status(500).json({ error: "Failed to generate auth URL" });
  }
};

// Handle OAuth callback
exports.callback = async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code) return res.status(400).json({ error: "Authorization code required" });

    let userId;
    try {
      const stateData = JSON.parse(Buffer.from(state, "base64").toString());
      userId = stateData.userId;
    } catch { userId = req.user?.id; }

    if (!userId) return res.status(400).json({ error: "Invalid state parameter" });

    const tokenData = await linkedinService.exchangeCodeForToken(code);
    const profileData = await linkedinService.getProfile(tokenData.access_token);

    await linkedin_token.upsert({
      fk_user: userId,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000),
      linkedin_person_id: profileData.sub ? `urn:li:person:${profileData.sub}` : null,
      scope: tokenData.scope,
    });

    return res.json({ message: "LinkedIn connected successfully", profile: { name: profileData.name, email: profileData.email } });
  } catch (error) {
    console.error("LinkedIn callback error:", error);
    return res.status(500).json({ error: "Failed to connect LinkedIn" });
  }
};

// Check connection status
exports.status = async (req, res) => {
  try {
    const token = await linkedin_token.findOne({ where: { fk_user: req.user.id } });
    if (!token) return res.json({ connected: false });
    const isExpired = new Date(token.expires_at) < new Date();
    return res.json({ connected: !isExpired, expiresAt: token.expires_at, personId: token.linkedin_person_id });
  } catch (error) {
    return res.status(500).json({ error: "Failed to check status" });
  }
};

// Publish job to LinkedIn
exports.publishJob = async (req, res) => {
  try {
    const { profileId, text, applyLink } = req.body;
    const token = await linkedin_token.findOne({ where: { fk_user: req.user.id } });
    if (!token || new Date(token.expires_at) < new Date()) {
      return res.status(401).json({ error: "LinkedIn not connected or token expired. Please reconnect." });
    }

    const prof = await profile.findByPk(profileId, { include: [{ model: JobOffer, as: "JobOffer" }] });
    if (!prof) return res.status(404).json({ error: "Profile not found" });

    const postText = text || `🚀 We're hiring! ${prof.title}\n\n${prof.description || ""}\n\nApply now: ${applyLink || ""}`;
    const result = await linkedinService.publishPost(token.access_token, token.linkedin_person_id, postText, applyLink);

    // Save posting record
    if (prof.JobOffer) {
      await JobPosting.create({
        fk_JobOffer: prof.JobOffer.id, description: postText,
        plateform: "LinkedIn", URL: applyLink || null, status: "Published",
      });
    }

    return res.json({ message: "Published to LinkedIn", result });
  } catch (error) {
    console.error("Publish error:", error);
    return res.status(500).json({ error: error.message || "Failed to publish" });
  }
};

// Disconnect LinkedIn
exports.disconnect = async (req, res) => {
  try {
    await linkedin_token.destroy({ where: { fk_user: req.user.id } });
    return res.json({ message: "LinkedIn disconnected" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to disconnect" });
  }
};

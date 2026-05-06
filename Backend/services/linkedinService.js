const axios = require("axios");
require("dotenv").config();

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;

class LinkedInService {
  /**
   * Generate the OAuth 2.0 authorization URL
   * @param {string} state - CSRF protection state parameter
   * @returns {string} Authorization URL
   */
  getAuthorizationUrl(state) {
    const scopes = ["openid", "profile", "email", "w_member_social"];
    const params = new URLSearchParams({
      response_type: "code",
      client_id: LINKEDIN_CLIENT_ID,
      redirect_uri: LINKEDIN_REDIRECT_URI,
      state,
      scope: scopes.join(" "),
    });
    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   * @param {string} code - Authorization code from callback
   * @returns {Object} Token data
   */
  async exchangeCodeForToken(code) {
    try {
      const response = await axios.post(
        "https://www.linkedin.com/oauth/v2/accessToken",
        new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: LINKEDIN_REDIRECT_URI,
          client_id: LINKEDIN_CLIENT_ID,
          client_secret: LINKEDIN_CLIENT_SECRET,
        }).toString(),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      return {
        access_token: response.data.access_token,
        expires_in: response.data.expires_in,
        refresh_token: response.data.refresh_token || null,
        scope: response.data.scope,
      };
    } catch (error) {
      console.error("LinkedIn token exchange error:", error.response?.data || error.message);
      throw new Error("Failed to exchange LinkedIn authorization code");
    }
  }

  /**
   * Get the authenticated user's LinkedIn profile info
   * @param {string} accessToken
   * @returns {Object} Profile data
   */
  async getProfile(accessToken) {
    try {
      const response = await axios.get("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    } catch (error) {
      console.error("LinkedIn get profile error:", error.response?.data || error.message);
      throw new Error("Failed to get LinkedIn profile");
    }
  }

  /**
   * Publish a post to LinkedIn
   * @param {string} accessToken - User's access token
   * @param {string} personUrn - LinkedIn person URN (urn:li:person:xxxx)
   * @param {string} text - Post text content
   * @param {string} link - Optional link URL
   * @returns {Object} Post response
   */
  async publishPost(accessToken, personUrn, text, link = null) {
    const postBody = {
      author: personUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text,
          },
          shareMediaCategory: link ? "ARTICLE" : "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };

    // Add article link if provided
    if (link) {
      postBody.specificContent["com.linkedin.ugc.ShareContent"].media = [
        {
          status: "READY",
          originalUrl: link,
        },
      ];
    }

    try {
      const response = await axios.post(
        "https://api.linkedin.com/v2/ugcPosts",
        postBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("LinkedIn publish error:", error.response?.data || error.message);
      throw new Error("Failed to publish to LinkedIn: " + (error.response?.data?.message || error.message));
    }
  }
}

module.exports = new LinkedInService();

const axios = require("axios");
require("dotenv").config();

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;

// Use a recent API version (YYYYMM format)
const LINKEDIN_API_VERSION = "202604";

class LinkedInService {
  /** Generate OAuth 2.0 authorization URL */
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

  /** Exchange authorization code for access token */
  async exchangeCodeForToken(code) {
    try {
      console.log("[LinkedIn] Exchanging code for token...");
      console.log("[LinkedIn] Redirect URI:", LINKEDIN_REDIRECT_URI);
      
      const response = await axios.post(
        "https://www.linkedin.com/oauth/v2/accessToken",
        new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: LINKEDIN_REDIRECT_URI,
          client_id: LINKEDIN_CLIENT_ID,
          client_secret: LINKEDIN_CLIENT_SECRET,
        }).toString(),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      console.log("[LinkedIn] Token exchange success ✓");
      return {
        access_token: response.data.access_token,
        expires_in: response.data.expires_in || 5184000, // default 60 days
        refresh_token: response.data.refresh_token || null,
        scope: response.data.scope,
      };
    } catch (error) {
      const details = error.response?.data || error.message;
      console.error("[LinkedIn] Token exchange error:", JSON.stringify(details, null, 2));
      throw new Error(
        `Failed to exchange LinkedIn authorization code: ${
          typeof details === "object" ? details.error_description || details.error || JSON.stringify(details) : details
        }`
      );
    }
  }

  /** Get authenticated user's profile via OpenID Connect userinfo endpoint */
  async getProfile(accessToken) {
    try {
      console.log("[LinkedIn] Fetching user profile...");
      const response = await axios.get("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log("[LinkedIn] Profile fetched:", response.data.sub ? `sub=${response.data.sub}` : "no sub");
      return response.data;
    } catch (error) {
      console.error("[LinkedIn] Profile error:", error.response?.status, error.response?.data || error.message);
      throw new Error("Failed to get LinkedIn profile");
    }
  }

  /**
   * Publish a text post to LinkedIn using the REST /rest/posts API.
   * LinkedIn returns HTTP 201 with an empty body on success — the post ID
   * is in the `x-restli-id` response header.
   */
  async publishPost(accessToken, personUrn, text, link = null) {
    if (!personUrn) {
      throw new Error("LinkedIn person URN is missing. Please reconnect your LinkedIn account.");
    }

    const postBody = {
      author: personUrn,
      commentary: text,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    };

    // Add article attachment if a link was provided
    if (link) {
      postBody.content = {
        article: {
          source: link,
          title: "Apply Now",
          description: text.substring(0, 200),
        },
      };
    }

    try {
      console.log("[LinkedIn] Publishing post for", personUrn);
      const response = await axios.post(
        "https://api.linkedin.com/rest/posts",
        postBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "LinkedIn-Version": LINKEDIN_API_VERSION,
            "X-Restli-Protocol-Version": "2.0.0",
          },
          // LinkedIn returns 201 with empty body — don't fail on that
          validateStatus: (status) => status >= 200 && status < 300,
        }
      );

      const postId = response.headers["x-restli-id"] || response.headers["x-linkedin-id"] || null;
      console.log("[LinkedIn] Post published ✓, postId:", postId, "status:", response.status);

      return {
        success: true,
        postId,
        statusCode: response.status,
      };
    } catch (error) {
      const errData = error.response?.data;
      console.error("[LinkedIn] Publish error:", error.response?.status, JSON.stringify(errData, null, 2));

      // Extract the most useful error message from LinkedIn's response
      let msg = "Unknown error";
      if (errData) {
        msg =
          errData.message ||
          errData.error_description ||
          errData.errorDetailType ||
          (typeof errData === "string" ? errData : JSON.stringify(errData));
      } else {
        msg = error.message;
      }

      throw new Error("LinkedIn publish failed: " + msg);
    }
  }
}

module.exports = new LinkedInService();

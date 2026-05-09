const aiService = require("../services/aiService");
const { candidate, profile } = require("../models");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");

const CURRENT_RANKING_VERSION = 2; // v2 = direct file upload to AI

/* ══════════════════════════════════════════════
   ██  AI-FIRST CV RANKING — FILE UPLOAD  ██
   Sends CV file directly to OpenAI. No parsing.
   Single endpoint. Ranks once. Caches forever.
   ══════════════════════════════════════════════ */

exports.rankCV = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const forceRerank = req.query.force === "true"; // opt-in re-rank

    const cand = await candidate.findByPk(candidateId, {
      include: [{ model: profile, as: "Profile" }],
    });
    if (!cand) return res.status(404).json({ error: "Candidate not found" });
    if (!cand.Profile) return res.status(400).json({ error: "Candidate has no associated position" });

    // ── ANTI-DUPLICATE: Return cached result if already ranked ──
    if (cand.is_ranked && cand.ai_response_cache && !forceRerank) {
      console.log(`[AI] Candidate ${candidateId}: returning cached ranking (ranked at ${cand.ranking_timestamp})`);
      return res.json({
        ranking: JSON.parse(cand.ai_response_cache),
        cached: true,
        rankedAt: cand.ranking_timestamp,
      });
    }

    // ── Check CV exists ──
    if (!cand.cv_s3_path || cand.cv_s3_path === "no-cv") {
      return res.status(400).json({ error: "No CV uploaded for this candidate" });
    }

    const cvFilePath = path.join(__dirname, "..", "uploads", cand.cv_s3_path);
    if (!fs.existsSync(cvFilePath)) {
      return res.status(404).json({ error: "CV file not found on server" });
    }

    // ── CV Hash: detect duplicates across candidates ──
    const cvBuffer = fs.readFileSync(cvFilePath);
    const cvHash = crypto.createHash("sha256").update(cvBuffer).digest("hex");

    // Check if another candidate with same CV hash was already ranked for same profile
    if (!forceRerank) {
      const duplicate = await candidate.findOne({
        where: {
          cv_hash: cvHash,
          fk_profile: cand.fk_profile,
          is_ranked: true,
          id: { [Op.ne]: candidateId },
        },
      });
      if (duplicate && duplicate.ai_response_cache) {
        console.log(`[AI] Candidate ${candidateId}: reusing ranking from duplicate CV (candidate ${duplicate.id})`);
        const cachedResult = JSON.parse(duplicate.ai_response_cache);
        await cand.update({
          cv_hash: cvHash,
          is_ranked: true,
          ranking_timestamp: new Date(),
          ai_response_cache: duplicate.ai_response_cache,
          ranking_version: CURRENT_RANKING_VERSION,
          score_value: cachedResult.score || 0,
          score_description: cachedResult.summary || "",
          name: cachedResult.name || cand.name,
          email: cachedResult.email || cand.email,
          phone: cachedResult.phone || cand.phone,
          location: cachedResult.location || cand.location,
          education: cachedResult.education || cand.education,
          current_position: cachedResult.currentPosition || cand.current_position,
          years_of_experience: cachedResult.yearsOfExperience || cand.years_of_experience,
          technical_skills: (cachedResult.technicalSkills || []).join(", "),
        });
        return res.json({ ranking: cachedResult, cached: true, duplicateOf: duplicate.id });
      }
    }

    // ── SINGLE AI CALL — upload file directly to OpenAI ──
    console.log(`[AI] Candidate ${candidateId}: uploading CV file to OpenAI for ranking...`);
    const ranking = await aiService.rankCVWithFile(cvFilePath, cand.Profile);

    // ── Save result to database (cached forever) ──
    await cand.update({
      cv_hash: cvHash,
      is_ranked: true,
      ranking_timestamp: new Date(),
      ai_response_cache: JSON.stringify(ranking),
      ranking_version: CURRENT_RANKING_VERSION,
      score_value: ranking.score || 0,
      score_description: ranking.summary || "",
      name: ranking.name || cand.name,
      email: ranking.email || cand.email,
      phone: ranking.phone || cand.phone,
      location: ranking.location || cand.location,
      education: ranking.education || cand.education,
      current_position: ranking.currentPosition || cand.current_position,
      years_of_experience: ranking.yearsOfExperience || cand.years_of_experience,
      technical_skills: (ranking.technicalSkills || []).join(", "),
    });

    console.log(`[AI] Candidate ${candidateId}: ranked ${ranking.score}/100 ✓`);
    return res.json({ ranking, cached: false });
  } catch (error) {
    console.error("Rank CV error:", error);
    return res.status(500).json({ error: error.message || "Failed to rank CV" });
  }
};

/* ══════════════════════════════════════════════
   ██  RANK ALL CANDIDATES  ██
   Ranks all unranked candidates for a project.
   Processes sequentially to avoid API rate limits.
   ══════════════════════════════════════════════ */

exports.rankAll = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Find all profiles for this project
    const profiles = await profile.findAll({
      where: { fk_project: projectId },
      attributes: ["id"],
      raw: true,
    });
    const profileIds = profiles.map((p) => p.id);

    if (profileIds.length === 0) {
      return res.json({ message: "No positions found", results: [] });
    }

    // Get all candidates with CVs that haven't been ranked yet (or all if force)
    const forceRerank = req.query.force === "true";
    const where = {
      fk_profile: { [Op.in]: profileIds },
      cv_s3_path: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "no-cv" }] },
    };
    if (!forceRerank) {
      where[Op.or] = [{ is_ranked: false }, { is_ranked: null }];
    }

    const candidatesToRank = await candidate.findAll({
      where,
      include: [{ model: profile, as: "Profile" }],
    });

    if (candidatesToRank.length === 0) {
      return res.json({
        message: "All candidates are already ranked",
        results: [],
        totalRanked: 0,
        totalSkipped: 0,
      });
    }

    console.log(`[AI] Rank All: processing ${candidatesToRank.length} candidates for project ${projectId}...`);

    const results = [];
    let ranked = 0;
    let skipped = 0;
    let failed = 0;

    for (const cand of candidatesToRank) {
      const cvFilePath = path.join(__dirname, "..", "uploads", cand.cv_s3_path);

      // Skip if file doesn't exist
      if (!fs.existsSync(cvFilePath)) {
        results.push({ id: cand.id, name: cand.name, status: "skipped", reason: "CV file not found" });
        skipped++;
        continue;
      }

      try {
        // Check for duplicate CV hash
        const cvBuffer = fs.readFileSync(cvFilePath);
        const cvHash = crypto.createHash("sha256").update(cvBuffer).digest("hex");

        // Try to find cached result from same CV hash
        const duplicate = await candidate.findOne({
          where: {
            cv_hash: cvHash,
            fk_profile: cand.fk_profile,
            is_ranked: true,
            id: { [Op.ne]: cand.id },
          },
        });

        let ranking;
        if (duplicate && duplicate.ai_response_cache && !forceRerank) {
          ranking = JSON.parse(duplicate.ai_response_cache);
          console.log(`[AI] Rank All: candidate ${cand.id} reusing from duplicate ${duplicate.id}`);
        } else {
          // Upload file directly to OpenAI
          console.log(`[AI] Rank All: uploading CV for candidate ${cand.id} (${cand.name || 'unknown'})...`);
          ranking = await aiService.rankCVWithFile(cvFilePath, cand.Profile);
        }

        // Save result
        await cand.update({
          cv_hash: cvHash,
          is_ranked: true,
          ranking_timestamp: new Date(),
          ai_response_cache: JSON.stringify(ranking),
          ranking_version: CURRENT_RANKING_VERSION,
          score_value: ranking.score || 0,
          score_description: ranking.summary || "",
          name: ranking.name || cand.name,
          email: ranking.email || cand.email,
          phone: ranking.phone || cand.phone,
          location: ranking.location || cand.location,
          education: ranking.education || cand.education,
          current_position: ranking.currentPosition || cand.current_position,
          years_of_experience: ranking.yearsOfExperience || cand.years_of_experience,
          technical_skills: (ranking.technicalSkills || []).join(", "),
        });

        results.push({ id: cand.id, name: cand.name || ranking.name, status: "ranked", score: ranking.score });
        ranked++;
        console.log(`[AI] Rank All: candidate ${cand.id} ranked ${ranking.score}/100 ✓`);
      } catch (err) {
        console.error(`[AI] Rank All: failed for candidate ${cand.id}:`, err.message);
        results.push({ id: cand.id, name: cand.name, status: "failed", error: err.message });
        failed++;
      }
    }

    console.log(`[AI] Rank All complete: ${ranked} ranked, ${skipped} skipped, ${failed} failed`);
    return res.json({
      message: `Ranked ${ranked} candidates`,
      results,
      totalRanked: ranked,
      totalSkipped: skipped,
      totalFailed: failed,
    });
  } catch (error) {
    console.error("Rank All error:", error);
    return res.status(500).json({ error: error.message || "Failed to rank candidates" });
  }
};

/* ── Generate job description ──────────────── */
exports.generateDescription = async (req, res) => {
  try {
    const { title, skills, location, experienceYears, contractType } = req.body || {};
    if (!title) return res.status(400).json({ error: "Title is required" });
    const result = await aiService.generateJobDescription(title, skills || [], { location, experienceYears, contractType });
    return res.json({ description: result });
  } catch (error) {
    console.error("AI generate error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate description" });
  }
};

/* ══════════════════════════════════════════════
   ██  AI ANALYTICS RECOMMENDATIONS — CACHED  ██
   Smart caching: hash fingerprint + 24h TTL.
   Only calls OpenAI when data actually changes.
   ══════════════════════════════════════════════ */

const RECOMMENDATION_VERSION = "1";
const TTL_HOURS = 24;

/**
 * Build a deterministic SHA-256 hash from the analytics input data.
 * Any change in candidate count, scores, positions, etc. produces a new hash.
 */
function buildDataHash(data) {
  const fingerprint = JSON.stringify({
    totalProjects: data.totalProjects || 0,
    activeProjects: data.activeProjects || 0,
    totalCandidates: data.totalCandidates || 0,
    totalPositions: data.totalPositions || 0,
    screened: data.screened || 0,
    interviewed: data.interviewed || 0,
    offered: data.offered || 0,
    hired: data.hired || 0,
    v: RECOMMENDATION_VERSION,
  });
  return crypto.createHash("sha256").update(fingerprint).digest("hex");
}

exports.recommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = req.body || {};
    const forceRefresh = req.query.force === "true";

    const { ai_recommendation_cache } = require("../models");
    if (!ai_recommendation_cache) {
      // Model not yet synced — fall back to direct generation
      const recommendations = await aiService.generateRecommendations(data);
      return res.json({ recommendations, cached: false });
    }

    const dataHash = buildDataHash(data);
    const now = new Date();

    // ── Step 1: Check cache (unless force-refresh) ──
    if (!forceRefresh) {
      const cached = await ai_recommendation_cache.findOne({
        where: {
          fk_user: userId,
          data_hash: dataHash,
          ai_version: RECOMMENDATION_VERSION,
        },
      });

      if (cached && new Date(cached.ttl_expires_at) > now) {
        console.log(`[AI Cache] HIT — user ${userId}, hash ${dataHash.substring(0, 12)}…`);
        return res.json({
          recommendations: JSON.parse(cached.recommendations),
          cached: true,
          generatedAt: cached.ai_generated_at,
          expiresAt: cached.ttl_expires_at,
        });
      }

      // Cache exists but expired — will regenerate below
      if (cached) {
        console.log(`[AI Cache] EXPIRED — user ${userId}, regenerating…`);
      }
    } else {
      console.log(`[AI Cache] FORCE REFRESH — user ${userId}`);
    }

    // ── Step 2: Generate fresh recommendations from OpenAI ──
    const recommendations = await aiService.generateRecommendations(data);
    const ttlExpiresAt = new Date(now.getTime() + TTL_HOURS * 60 * 60 * 1000);

    // ── Step 3: Upsert into cache (unique on fk_user + data_hash) ──
    const existing = await ai_recommendation_cache.findOne({
      where: { fk_user: userId, data_hash: dataHash },
    });

    if (existing) {
      await existing.update({
        recommendations: JSON.stringify(recommendations),
        ai_generated_at: now,
        ai_version: RECOMMENDATION_VERSION,
        input_snapshot: JSON.stringify(data),
        ttl_expires_at: ttlExpiresAt,
      });
    } else {
      await ai_recommendation_cache.create({
        fk_user: userId,
        data_hash: dataHash,
        recommendations: JSON.stringify(recommendations),
        ai_generated_at: now,
        ai_version: RECOMMENDATION_VERSION,
        input_snapshot: JSON.stringify(data),
        ttl_expires_at: ttlExpiresAt,
      });
    }

    // ── Step 4: Cleanup old caches for this user (keep last 5) ──
    const allCaches = await ai_recommendation_cache.findAll({
      where: { fk_user: userId },
      order: [["ai_generated_at", "DESC"]],
      attributes: ["id"],
    });
    if (allCaches.length > 5) {
      const toDelete = allCaches.slice(5).map((c) => c.id);
      await ai_recommendation_cache.destroy({ where: { id: toDelete } });
    }

    console.log(`[AI Cache] STORED — user ${userId}, hash ${dataHash.substring(0, 12)}…, expires ${ttlExpiresAt.toISOString()}`);
    return res.json({
      recommendations,
      cached: false,
      generatedAt: now,
      expiresAt: ttlExpiresAt,
    });
  } catch (error) {
    console.error("Recommendations error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate recommendations" });
  }
};

/* ── Generate LinkedIn post ────────────────── */
exports.generatePost = async (req, res) => {
  try {
    if (!req.body?.title) return res.status(400).json({ error: "Position title is required" });
    const post = await aiService.generatePost(req.body);
    return res.json({ content: post });
  } catch (error) {
    console.error("Generate post error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate post" });
  }
};

/* ── AI Chat (HireX-scoped assistant) ──────── */
exports.chat = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required" });
    }
    const reply = await aiService.chat(messages);
    return res.json({ reply });
  } catch (error) {
    console.error("AI Chat error:", error);
    return res.status(500).json({ error: error.message || "Chat failed" });
  }
};

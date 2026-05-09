const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

class AiService {
  /* ── Core call (token-optimized) ───────────── */
  async _call(prompt, maxTokens = 800) {
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY missing");
    const res = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You are a concise recruitment AI. Return minimal, compact JSON. No extra whitespace." },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      max_tokens: maxTokens,
    });
    const content = res.choices?.[0]?.message?.content;
    if (!content) throw new Error("OpenAI returned empty response");
    return content;
  }

  _parseJSON(text) {
    const clean = String(text || "").replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    try { return JSON.parse(clean); } catch {
      const match = clean.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (!match) throw new Error("No valid JSON in response");
      return JSON.parse(match[0]);
    }
  }

  /* ══════════════════════════════════════════════
     ██  AI-FIRST CV RANKING — FILE UPLOAD  ██
     Sends the CV file directly to OpenAI.
     No PDF parsing — the AI reads the file natively.
     ══════════════════════════════════════════════ */
  async rankCVWithFile(cvFilePath, jobProfile) {
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY missing");

    const job = {
      title: jobProfile.title || "",
      skills: jobProfile.technicalSkills || "",
      softSkills: jobProfile.softSkills || "",
      experience: jobProfile.yearsOfExperience || "",
      education: jobProfile.education || "",
      location: jobProfile.location || "",
      contract: jobProfile.typeContract || "",
      description: (jobProfile.description || "").substring(0, 300),
    };

    const ext = path.extname(cvFilePath).toLowerCase();
    const fileBuffer = fs.readFileSync(cvFilePath);
    const base64 = fileBuffer.toString("base64");

    // Build message content parts
    const contentParts = [];

    if (ext === ".pdf") {
      // Send PDF directly to OpenAI — it reads PDFs natively
      contentParts.push({
        type: "file",
        file: {
          filename: path.basename(cvFilePath),
          file_data: `data:application/pdf;base64,${base64}`,
        },
      });
    } else if ([".png", ".jpg", ".jpeg", ".gif", ".webp"].includes(ext)) {
      // Image CV (screenshot/scan)
      const mimeType = ext === ".jpg" ? "image/jpeg" : `image/${ext.slice(1)}`;
      contentParts.push({
        type: "image_url",
        image_url: { url: `data:${mimeType};base64,${base64}` },
      });
    } else {
      // Plain text / docx fallback — read as text
      const textContent = fileBuffer.toString("utf-8");
      contentParts.push({
        type: "text",
        text: `CV CONTENT:\n${textContent.substring(0, 5000)}`,
      });
    }

    // Add the analysis prompt
    contentParts.push({
      type: "text",
      text: `Analyze this CV against the job. Return ONE JSON object.

JOB: ${JSON.stringify(job)}

Return ONLY this JSON (no markdown):
{"score":0,"matchPercent":0,"name":"","email":"","phone":"","location":"","currentPosition":"","education":"","yearsOfExperience":0,"technicalSkills":[],"recommendation":"hire|consider|pass","strengths":["",""],"weaknesses":["",""],"technicalFit":"","experienceEval":"","communicationQuality":"","seniorityLevel":"junior|mid|senior|lead","summary":"2 sentence recruiter summary"}

Rules:
- score: 0-100 overall ranking
- matchPercent: 0-100 job fit %
- Extract candidate info from CV
- Be fair: 80+ strong, 60-79 good, 40-59 possible, <40 weak
- recommendation: hire (70+), consider (40-69), pass (<40)
- strengths/weaknesses: 2-3 items each, specific
- technicalFit: 1 sentence on tech skill match
- experienceEval: 1 sentence on experience level
- communicationQuality: 1 sentence on CV quality/clarity`,
    });

    try {
      const res = await client.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: "You are a concise recruitment AI. Return minimal, compact JSON. No extra whitespace." },
          { role: "user", content: contentParts },
        ],
        temperature: 0.4,
        max_tokens: 800,
      });
      const content = res.choices?.[0]?.message?.content;
      if (!content) throw new Error("OpenAI returned empty response");
      return this._parseJSON(content);
    } catch (e) {
      throw new Error("CV ranking failed: " + e.message);
    }
  }

  /* ── Generate Job Description ──────────────── */
  async generateJobDescription(title, skills, options = {}) {
    const { location, experienceYears, contractType } = options;
    const prompt = `Job desc for: ${title}. Skills: ${Array.isArray(skills)?skills.join(","):skills||""}${location?". Loc:"+location:""}${experienceYears?". Exp:"+experienceYears+"y":""}${contractType?". Contract:"+contractType:""}\nReturn ONLY JSON: {"title":"","summary":"","responsibilities":["","",""],"requirements":["","",""],"benefits":["",""],"fullDescription":""}`;
    try { return this._parseJSON(await this._call(prompt, 1000)); }
    catch (e) { throw new Error("Job desc failed: " + e.message); }
  }

  /* ── AI Analytics Recommendations ──────────── */
  async generateRecommendations(data) {
    const prompt = `Give 3 short recruitment tips based on: ${data.totalCandidates||0} candidates, ${data.totalPositions||0} positions, ${data.activeProjects||0} active projects, ${data.screened||0} screened, ${data.interviewed||0} interviewed, ${data.hired||0} hired.\nReturn ONLY JSON array: [{"title":"","description":"","priority":"high|medium|low","category":"screening|interviews|sourcing|pipeline"}]`;
    try { return this._parseJSON(await this._call(prompt, 500)); }
    catch (e) { throw new Error("Recommendations failed: " + e.message); }
  }

  /* ── Generate LinkedIn Post ─────────────────── */
  async generatePost(profileData) {
    const prompt = `Write a short LinkedIn job post (<800 chars) for: ${profileData.title}${profileData.technicalSkills?". Skills:"+profileData.technicalSkills:""}${profileData.location?". Loc:"+profileData.location:""}${profileData.typeContract?". Type:"+profileData.typeContract:""}\nReturn ONLY the post text, no JSON.`;
    try { return await this._call(prompt, 400); }
    catch (e) { throw new Error("Post generation failed: " + e.message); }
  }
  /* ── AI Chat Assistant (HireX-scoped) ────────── */
  async chat(messages, maxTokens = 400) {
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY missing");

    const systemPrompt = `You are the HireX AI assistant — strictly limited to recruitment, HR, and HireX platform features.

SCOPE: recruitment, candidates, CV analysis, hiring, interviews, HR analytics, job positions, dashboard help, application features.

RULES:
- NEVER answer topics outside scope (politics, religion, coding unrelated to HireX, hacking, games, math, science, general knowledge).
- If off-topic, reply ONLY: "I'm specialized only in HireX recruitment features and HR-related assistance."
- Keep answers short, professional, helpful.
- Use markdown bold for key terms.
- Max 3-4 sentences unless detail is requested.`;

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.slice(-6), // Keep last 6 messages for context, saves tokens
    ];

    const res = await client.chat.completions.create({
      model: MODEL,
      messages: apiMessages,
      temperature: 0.5,
      max_tokens: maxTokens,
    });

    const content = res.choices?.[0]?.message?.content;
    if (!content) throw new Error("OpenAI returned empty response");
    return content;
  }
}

module.exports = new AiService();

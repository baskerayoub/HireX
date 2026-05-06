const OpenAI = require("openai");
require("dotenv").config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || "gpt-5.4-mini";
const FALLBACK_MODEL = process.env.OPENAI_FALLBACK_MODEL || "gpt-3.5-turbo";

class AiService {
  async _call(prompt) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is missing in Backend/.env");
    }

    const tryModels = [...new Set([MODEL, FALLBACK_MODEL].filter(Boolean))];
    let lastError = null;

    for (const model of tryModels) {
      try {
        const res = await client.responses.create({
          model,
          input: prompt,
          text: {
            format: { type: "text" },
            verbosity: "medium",
          },
          reasoning: { effort: "medium", summary: "auto" },
          store: false,
        });

        // Extract best text from responses API
        let content = null;
        if (res.output_text) content = res.output_text;
        else if (Array.isArray(res.output) && res.output.length) {
          // Try to find an item with type "output_text"
          for (const out of res.output) {
            if (out.type === "output_text" && out.text) {
              content = out.text;
              break;
            }
            if (out.content && Array.isArray(out.content)) {
              // Some responses have content blocks
              for (const c of out.content) {
                if (c.type === "output_text" && c.text) {
                  content = c.text;
                  break;
                }
                if (c.type === "message" && c.text) {
                  content = c.text;
                  break;
                }
              }
              if (content) break;
            }
          }
        }

        if (content) return content;
        lastError = new Error(`OpenAI Responses returned empty content with model ${model}`);
      } catch (error) {
        lastError = error;
        const msg = (error?.message || "").toLowerCase();
        console.warn(`OpenAI model ${model} failed:`, error.message || error);

        if (error?.status === 404 || msg.includes("does not exist") || msg.includes("not have access")) {
          console.info(`Falling back from model ${model} to next available model.`);
          continue;
        }

        break;
      }
    }

    throw lastError;
  }

  // Clean JSON from AI response (remove markdown fences if any)
  _parseJSON(text) {
    const clean = String(text || "")
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    try {
      return JSON.parse(clean);
    } catch {
      const match = clean.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (!match) throw new Error("OpenAI did not return JSON");
      return JSON.parse(match[0]);
    }
  }

  async generateJobDescription(title, skills, options = {}) {
    const { location, experienceYears, contractType } = options;
    const skillList = Array.isArray(skills) ? skills.join(", ") : String(skills || "");
    const prompt = [
      "Create a short, professional job description.",
      `Title: ${title}`,
      `Skills: ${skillList}`,
      location ? `Location: ${location}` : "",
      experienceYears ? `Experience: ${experienceYears} years` : "",
      contractType ? `Contract: ${contractType}` : "",
      'Return ONLY compact JSON like this: {"title":"","summary":"","responsibilities":["","",""],"requirements":["","",""],"benefits":["",""],"fullDescription":""}',
    ].filter(Boolean).join("\n");

    try {
      return this._parseJSON(await this._call(prompt));
    } catch (error) {
      console.error("AI generateJobDescription error:", error.message);
      throw new Error("Failed to generate job description: " + error.message);
    }
  }

  async parseCv(cvText, aiProvider = "openai") {
    const prompt = [
      "Extract as much useful candidate information as possible from this CV.",
      "Infer carefully when the CV is clear, but use empty strings or empty arrays when information is not present.",
      "For location, capture city/country if available. For yearsOfExperience, estimate from work history if not explicitly written.",
      "Separate technical skills from soft skills. Include tools, frameworks, languages, databases, cloud, methods, and domain knowledge.",
      "Return ONLY compact JSON with this shape:",
      '{"name":"","email":"","phone":"","location":"","currentPosition":"","education":"","yearsOfExperience":0,"technicalSkills":[],"softSkills":[],"languages":[],"certifications":[],"hobbies":[],"experiences":[{"title":"","company":"","duration":"","location":"","description":"","technologies":[]}],"summary":"2 useful sentences"}',
      `CV TEXT:\n${String(cvText || "").substring(0, 9000)}`,
    ].join("\n");

    try {
      return this._parseJSON(await this._call(prompt));
    } catch (error) {
      console.error("AI parseCv error:", error.message);
      throw new Error("Failed to parse CV: " + error.message);
    }
  }

  async calculateMatchScore(candidateData, jobProfile, aiProvider = "openai") {
    const prompt = [
      "Evaluate this candidate for the job. Be fair and precise.",
      "Scoring rules:",
      "- Score 0-100. Do not make the score extremely low for one missing item if the candidate has related experience.",
      "- Technical skills are important, but experience, education, role similarity, location/contract fit, and transferable skills also count.",
      "- If a candidate misses an important skill, explain it and reduce the score proportionally. A decent partial match can still be 40-60.",
      "- Use 80+ only for strong matches, 60-79 for good partial matches, 40-59 for possible but risky matches, under 40 for weak matches.",
      "Return ONLY compact JSON with this shape:",
      '{"overallScore":0,"skillMatchScore":0,"experienceScore":0,"educationScore":0,"roleFitScore":0,"locationFitScore":0,"matchedSkills":[],"partialMatchedSkills":[],"missingSkills":[],"missingCriticalSkills":[],"strengths":[],"weaknesses":[],"lowScoreReasons":[],"recommendation":"","summary":""}',
      `JOB PROFILE:\n${JSON.stringify({
        title: jobProfile.title || "",
        description: jobProfile.description || "",
        technicalSkills: jobProfile.technicalSkills || "",
        softSkills: jobProfile.softSkills || "",
        languages: jobProfile.languages || "",
        mainMissions: jobProfile.mainMissions || "",
        education: jobProfile.education || "",
        yearsOfExperience: jobProfile.yearsOfExperience || null,
        location: jobProfile.location || "",
        typeContract: jobProfile.typeContract || "",
      })}`,
      `CANDIDATE:\n${JSON.stringify(candidateData)}`,
    ].join("\n");

    try {
      return this._parseJSON(await this._call(prompt));
    } catch (error) {
      console.error("AI matchScore error:", error.message);
      throw new Error("Failed to calculate match score: " + error.message);
    }
  }

  async rankCandidates(candidates, jobProfile, aiProvider = "openai") {
    const list = candidates.map((c, i) => ({
      i, n: c.name || `C${i + 1}`,
      s: c.technical_skills || c.technicalSkills || "",
      soft: c.soft_skills || c.softSkills || "",
      e: c.years_of_experience || c.yearsOfExperience || 0,
      edu: c.education || "",
      pos: c.current_position || c.currentPosition || "",
      loc: c.location || "",
      sum: c.summary || "",
    }));

    const prompt = [
      "Rank these candidates for the job. Be fair and precise.",
      "Use the same 0-100 scoring logic: 80+ strong, 60-79 good partial, 40-59 possible but risky, under 40 weak.",
      "Do not give a very low score only because one skill is missing if the candidate has related skills or relevant experience.",
      "Explain clearly why each score is high or low.",
      `JOB:\n${JSON.stringify({
        title: jobProfile.title || "",
        description: jobProfile.description || "",
        technicalSkills: jobProfile.technicalSkills || "",
        softSkills: jobProfile.softSkills || "",
        languages: jobProfile.languages || "",
        mainMissions: jobProfile.mainMissions || "",
        education: jobProfile.education || "",
        yearsOfExperience: jobProfile.yearsOfExperience || null,
        location: jobProfile.location || "",
        typeContract: jobProfile.typeContract || "",
      })}`,
      `CANDIDATES:\n${JSON.stringify(list)}`,
      'Return ONLY compact JSON array: [{"index":0,"name":"","score":0,"rank":1,"matchSummary":"","lowScoreReasons":[],"matchedSkills":[],"missingSkills":[]}]',
    ].join("\n");

    try {
      return this._parseJSON(await this._call(prompt));
    } catch (error) {
      console.error("AI rankCandidates error:", error.message);
      throw new Error("Failed to rank candidates: " + error.message);
    }
  }
}

module.exports = new AiService();

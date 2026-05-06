const aiService = require("../services/aiService");
const { candidate, profile, ai_analysis } = require("../models");
const fs = require("fs");
const path = require("path");

// Generate job description using AI
exports.generateDescription = async (req, res) => {
  try {
    const { title, skills, location, experienceYears, contractType, aiProvider } = req.body || {};
    if (!title || !skills || !skills.length) {
      return res.status(400).json({ error: "Title and skills are required" });
    }
    const result = await aiService.generateJobDescription(title, skills, { location, experienceYears, contractType, aiProvider });
    return res.json({ description: result });
  } catch (error) {
    console.error("AI generate error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate description" });
  }
};

// Parse a candidate's CV using AI
exports.parseCv = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const cand = await candidate.findByPk(candidateId);
    if (!cand) return res.status(404).json({ error: "Candidate not found" });

    let cvText = "";
    if (cand.cv_s3_path && cand.cv_s3_path !== "no-cv") {
      const cvFile = path.join(__dirname, "..", "uploads", cand.cv_s3_path);
      if (fs.existsSync(cvFile) && cvFile.endsWith(".pdf")) {
        try {
          const pdfParse = require("pdf-parse");
          const dataBuffer = fs.readFileSync(cvFile);
          const pdfData = await pdfParse(dataBuffer);
          cvText = pdfData.text;
        } catch (e) { cvText = "Unable to parse PDF"; }
      } else {
          cvText = [
            `Candidate: ${cand.name || ""}`,
            `Email: ${cand.email || ""}`,
            `Phone: ${cand.phone || ""}`,
            `Location: ${cand.location || ""}`,
            `Current position: ${cand.current_position || ""}`,
            `Skills: ${cand.technical_skills || ""}`,
            `Soft skills: ${cand.soft_skills || ""}`,
            `Languages: ${cand.languages || ""}`,
            `Experience: ${cand.years_of_experience || 0} years`,
            `Education: ${cand.education || ""}`,
            `Summary: ${cand.summary || ""}`,
          ].join("\n");
        }
      } else {
        cvText = [
          `Candidate: ${cand.name || ""}`,
          `Email: ${cand.email || ""}`,
          `Phone: ${cand.phone || ""}`,
          `Location: ${cand.location || ""}`,
          `Current position: ${cand.current_position || ""}`,
          `Skills: ${cand.technical_skills || ""}`,
          `Soft skills: ${cand.soft_skills || ""}`,
          `Languages: ${cand.languages || ""}`,
          `Experience: ${cand.years_of_experience || 0} years`,
          `Education: ${cand.education || ""}`,
          `Summary: ${cand.summary || ""}`,
        ].join("\n");
      }

    const aiProvider = req.body?.aiProvider || req.query.aiProvider;
    const parsed = await aiService.parseCv(cvText, aiProvider);

    // Save analysis
    const analysis = await ai_analysis.create({
      fk_candidate: candidateId, analysis_type: "cv_parse",
      input_data: JSON.stringify({ cvText: cvText.substring(0, 2000) }),
      output_data: JSON.stringify(parsed),
      skills_found: JSON.stringify([...(parsed.technicalSkills || []), ...(parsed.softSkills || [])]),
      experience_years: parsed.yearsOfExperience || null,
      summary: parsed.summary || null, status: "completed",
    });

    // Update candidate with parsed data
    await cand.update({
      name: parsed.name || cand.name, email: parsed.email || cand.email,
      phone: parsed.phone || cand.phone, location: parsed.location || cand.location,
      education: parsed.education || cand.education,
      current_position: parsed.currentPosition || cand.current_position,
      years_of_experience: parsed.yearsOfExperience || cand.years_of_experience,
      technical_skills: (parsed.technicalSkills || []).join(", "),
      soft_skills: (parsed.softSkills || []).join(", "),
      languages: (parsed.languages || []).join(", "),
      certifications: (parsed.certifications || []).join(", "),
      hobbies: (parsed.hobbies || []).join(", "),
      experiences: JSON.stringify(parsed.experiences || []),
      summary: parsed.summary || cand.summary,
    });

    return res.json({ message: "CV parsed successfully", analysis: parsed, analysisId: analysis.id });
  } catch (error) {
    console.error("Parse CV error:", error);
    return res.status(500).json({ error: error.message || "Failed to parse CV" });
  }
};

// Calculate match score between candidate and job profile
exports.matchScore = async (req, res) => {
  try {
    const { candidateId, profileId } = req.params;
    const cand = await candidate.findByPk(candidateId);
    if (!cand) return res.status(404).json({ error: "Candidate not found" });
    const prof = await profile.findByPk(profileId);
    if (!prof) return res.status(404).json({ error: "Profile not found" });

    const candidateData = {
      technicalSkills: cand.technical_skills ? cand.technical_skills.split(",").map(s => s.trim()) : [],
      softSkills: cand.soft_skills ? cand.soft_skills.split(",").map(s => s.trim()) : [],
      languages: cand.languages ? cand.languages.split(",").map(s => s.trim()) : [],
      certifications: cand.certifications ? cand.certifications.split(",").map(s => s.trim()) : [],
      hobbies: cand.hobbies ? cand.hobbies.split(",").map(s => s.trim()) : [],
      yearsOfExperience: cand.years_of_experience, education: cand.education,
      currentPosition: cand.current_position,
      location: cand.location,
      summary: cand.summary,
      experiences: cand.experiences,
    };
    
    const aiProvider = req.body?.aiProvider || req.query.aiProvider;
    const result = await aiService.calculateMatchScore(candidateData, prof, aiProvider);

    await ai_analysis.create({
      fk_candidate: candidateId, analysis_type: "match_score",
      input_data: JSON.stringify({ candidateData, profile: { title: prof.title, technicalSkills: prof.technicalSkills } }),
      output_data: JSON.stringify(result), match_score: result.overallScore || 0,
      summary: result.summary || null, status: "completed",
    });
    const scoreDetails = [
      result.summary,
      result.recommendation ? `Recommendation: ${result.recommendation}` : "",
      result.lowScoreReasons?.length ? `Why score is lower: ${result.lowScoreReasons.join("; ")}` : "",
      result.missingCriticalSkills?.length ? `Critical missing skills: ${result.missingCriticalSkills.join(", ")}` : "",
      result.weaknesses?.length ? `Weaknesses: ${result.weaknesses.join("; ")}` : "",
      result.strengths?.length ? `Strengths: ${result.strengths.join("; ")}` : "",
    ].filter(Boolean).join("\n");

    await cand.update({ score_value: result.overallScore || 0, score_description: scoreDetails });

    return res.json({ match: result });
  } catch (error) {
    console.error("Match score error:", error);
    return res.status(500).json({ error: error.message || "Failed to calculate match" });
  }
};

// Rank all candidates for a profile
exports.rankCandidates = async (req, res) => {
  try {
    const { profileId } = req.params;
    const prof = await profile.findByPk(profileId);
    if (!prof) return res.status(404).json({ error: "Profile not found" });
    const candidates_list = await candidate.findAll({ where: { fk_profile: profileId } });
    if (!candidates_list.length) return res.json({ ranking: [] });

    const aiProvider = req.body?.aiProvider || req.query.aiProvider;
    const ranking = await aiService.rankCandidates(candidates_list.map(c => c.toJSON()), prof.toJSON(), aiProvider);

    // Update scores
    for (const r of ranking) {
      const c = candidates_list[r.index];
      if (c) {
        const rankDetails = [
          r.matchSummary,
          r.lowScoreReasons?.length ? `Why score is lower: ${r.lowScoreReasons.join("; ")}` : "",
          r.missingSkills?.length ? `Missing skills: ${r.missingSkills.join(", ")}` : "",
          r.matchedSkills?.length ? `Matched skills: ${r.matchedSkills.join(", ")}` : "",
        ].filter(Boolean).join("\n");

        await c.update({
          score_value: r.score || 0,
          manual_rank: r.rank || null,
          score_description: rankDetails || c.score_description,
        });
      }
    }

    return res.json({ ranking });
  } catch (error) {
    console.error("Rank error:", error);
    return res.status(500).json({ error: error.message || "Failed to rank candidates" });
  }
};

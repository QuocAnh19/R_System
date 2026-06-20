const { generateRecommendation } = require("../services/recommendationService");
const careers = require("../data/careers");
const skills = require("../data/skills");
const careerSkills = require("../data/careerSkills");

exports.recommend = (req, res) => {
  const { career, skills: userSkills } = req.body;
  const result = generateRecommendation(career, userSkills);

  if (result.error) {
    return res.status(400).json(result);
  }
  res.json(result);
};

exports.getCareers = (req, res) => {
  res.json(careers);
};

exports.getSkills = (req, res) => {
  res.json(skills);
};

exports.getSkillsByCareer = (req, res) => {
  const { careerName } = req.params;

  if (!careerSkills[careerName]) {
    return res.status(404).json({ error: "Career not found" });
  }
  res.json(careerSkills[careerName]);
};

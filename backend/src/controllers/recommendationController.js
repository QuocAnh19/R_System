const { generateRecommendation } = require("../services/recommendationService");

exports.recommend = (req, res) => {
  const { career, skills } = req.body;

  const result = generateRecommendation(career, skills);

  res.json(result);
};

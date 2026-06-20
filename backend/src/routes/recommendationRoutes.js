const express = require("express");
const router = express.Router();

const {
  recommend,
  getCareers,
  getSkills,
  getSkillsByCareer,
} = require("../controllers/recommendationController");

router.post("/recommend", recommend);
router.get("/careers", getCareers);
router.get("/skills", getSkills);
router.get("/skills/:careerName", getSkillsByCareer);

module.exports = router;

const careerSkills = require("../data/careerSkills");
const courses = require("../data/courses");
const roadmaps = require("../data/roadmaps");

function generateRecommendation(careerName, userSkills) {
  if (!careerSkills[careerName]) {
    return {
      error: "Career not found",
    };
  }
  const requiredSkills = careerSkills[careerName];

  const matchedSkills = requiredSkills.filter((skill) =>
    userSkills.includes(skill),
  );

  const missingSkills = requiredSkills.filter(
    (skill) => !userSkills.includes(skill),
  );

  const score = Math.round(
    (matchedSkills.length / requiredSkills.length) * 100,
  );

  const recommendedCourses = courses.filter((course) =>
    missingSkills.includes(course.skill),
  );

  const roadmap = roadmaps[careerName].map((item) => ({
    ...item,
    completed: userSkills.includes(item.skill),
  }));

  return {
    career: careerName,
    score,
    matchedSkills,
    missingSkills,
    recommendedCourses,
    roadmap,

    analysis: `
    Bạn hiện đã có ${matchedSkills.length}/${requiredSkills.length}
    kỹ năng cần thiết cho vị trí ${careerName}.
    Bạn nên học thêm:
    ${missingSkills.join(", ")}
    để tăng khả năng phù hợp.
    `,
  };
}

module.exports = {
  generateRecommendation,
};

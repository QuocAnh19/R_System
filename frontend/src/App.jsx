import { useState } from "react";

import AssessmentPage from "./pages/AssessmentPage";

import ResultPage from "./pages/ResultPage";

import { getRecommendation } from "./services/recommendationApi";

function App() {
  const [result, setResult] = useState(null);

  const handleGenerate = async (data) => {
    const response = await getRecommendation(data);

    setResult(response);
  };

  if (result) {
    return <ResultPage result={result} onBack={() => setResult(null)} />;
  }

  return <AssessmentPage onGenerate={handleGenerate} />;
}

export default App;

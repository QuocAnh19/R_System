import { useState } from "react";

import AssessmentPage from "./pages/AssessmentPage";
import ResultPage from "./pages/ResultPage";

import { getRecommendation } from "./services/recommendationApi";

function App() {
  const [result, setResult] = useState(null);

  const handleGenerate = async (data) => {
    try {
      const response = await getRecommendation(data);
      setResult(response);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        "Không thể kết nối tới server. Vui lòng thử lại.";
      setResult({ error: message });
    }
  };

  if (result) {
    return <ResultPage result={result} onBack={() => setResult(null)} />;
  }

  return <AssessmentPage onGenerate={handleGenerate} />;
}

export default App;

import { useState, FormEvent, useEffect } from 'react';
import { Leaf } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { ResultSection } from './components/ResultSection';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { CropInput, FinalResult, NumericCropInput, PredictionResult } from './types';
import { predictCrop } from './lib/cropLogic';

interface HistoryItem {
  input: CropInput;
  result: PredictionResult;
  timestamp: number;
}

export default function App() {
  const [input, setInput] = useState<CropInput>({
    N: '',
    P: '',
    K: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CropInput, string>>>({});
  const [result, setResult] = useState<FinalResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from local storage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('agro_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to local storage when it changes
  useEffect(() => {
    localStorage.setItem('agro_history', JSON.stringify(history));
  }, [history]);

  const clearError = (field: keyof CropInput) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleSelectHistory = (selectedInput: CropInput) => {
    setInput(selectedInput);
    setErrors({});
    // Scroll to top of sidebar for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử dự đoán?')) {
      setHistory([]);
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CropInput, string>> = {};
    
    // Helper to check if a value is a valid number
    const isValidNumber = (val: string) => val !== '' && !isNaN(Number(val));

    // Required fields check
    (Object.keys(input) as Array<keyof CropInput>).forEach(key => {
      if (input[key] === '') {
        newErrors[key] = 'Trường này là bắt buộc';
      } else if (isNaN(Number(input[key]))) {
        newErrors[key] = 'Vui lòng nhập số hợp lệ';
      }
    });

    // Range validations (only if it's a valid number)
    if (isValidNumber(input.N)) {
      const n = Number(input.N);
      if (n < 0 || n > 200) newErrors.N = 'Nito nên từ 0 đến 200';
    }
    if (isValidNumber(input.P)) {
      const p = Number(input.P);
      if (p < 0 || p > 200) newErrors.P = 'Phốt pho nên từ 0 đến 200';
    }
    if (isValidNumber(input.K)) {
      const k = Number(input.K);
      if (k < 0 || k > 300) newErrors.K = 'Kali nên từ 0 đến 300';
    }
    if (isValidNumber(input.temperature)) {
      const temp = Number(input.temperature);
      if (temp < -10 || temp > 60) newErrors.temperature = 'Nhiệt độ không hợp lệ (-10 đến 60°C)';
    }
    if (isValidNumber(input.humidity)) {
      const hum = Number(input.humidity);
      if (hum < 0 || hum > 100) newErrors.humidity = 'Độ ẩm phải từ 0% đến 100%';
    }
    if (isValidNumber(input.ph)) {
      const ph = Number(input.ph);
      if (ph < 0 || ph > 14) newErrors.ph = 'Độ pH phải từ 0 đến 14';
    }
    if (isValidNumber(input.rainfall)) {
      const rain = Number(input.rainfall);
      if (rain < 0 || rain > 1000) newErrors.rainfall = 'Lượng mưa nên từ 0 đến 1000mm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePredict = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsLoading(true);
    try {
      // Convert all inputs to numbers for logic
      const numericInput: NumericCropInput = {
        N: Number(input.N),
        P: Number(input.P),
        K: Number(input.K),
        temperature: Number(input.temperature),
        humidity: Number(input.humidity),
        ph: Number(input.ph),
        rainfall: Number(input.rainfall)
      };

      const prediction = await predictCrop(numericInput);
      setResult(prediction);

      // Add to history
      const newHistoryItem: HistoryItem = {
        input: { ...input },
        result: prediction.final,
        timestamp: Date.now()
      };
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 10)); // Keep last 10 items
    } catch (error) {
      console.error("Prediction failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] font-sans selection:bg-agro-green/20">
      <div className="container mx-auto px-4 py-8 md:px-12 md:py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-4 mb-4">
            <div className="bg-agro-dark p-4 rounded-[25px] shadow-xl text-white">
              <Leaf size={40} strokeWidth={2.5} />
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-agro-dark tracking-tight flex items-center gap-2">
              AgroSmart <span className="font-black text-black">Predictor</span>
            </h1>
          </div>
          <p className="text-gray-600 font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Hệ thống tư vấn cây trồng dựa trên Hybrid AI & Rule-based.
            <br />
            Canh tác thông minh, Nông nghiệp bền vững
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Form */}
          <aside className="lg:col-span-3">
            <Sidebar 
              input={input} 
              setInput={setInput} 
              onPredict={handlePredict} 
              onClearError={clearError}
              errors={errors}
              history={history}
              onSelectHistory={handleSelectHistory}
              onClearHistory={handleClearHistory}
            />
          </aside>

          {/* Result Area */}
          <main className="lg:col-span-9">
            <ResultSection result={result} isLoading={isLoading} />
            
            {/* Analytics Dashboard */}
            <AnalyticsDashboard 
              history={history} 
              currentResult={result} 
              currentInput={input} 
            />
          </main>
        </div>
      </div>
    </div>
  );
}

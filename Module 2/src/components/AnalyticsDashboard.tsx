import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { FinalResult, CropInput } from '../types';
import { Activity, BarChart3, Target } from 'lucide-react';
import { CROP_RANGES } from '../constants';

interface HistoryItem {
  input: CropInput;
  result: any;
  timestamp: number;
}

interface AnalyticsDashboardProps {
  history: HistoryItem[];
  currentResult: FinalResult | null;
  currentInput: CropInput;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ history, currentResult, currentInput }) => {
  // Prepare data for Trend Chart (Last 10 entries)
  const trendData = useMemo(() => {
    return [...history].reverse().map(item => ({
      time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      N: Number(item.input.N),
      P: Number(item.input.P),
      K: Number(item.input.K),
      pH: Number(item.input.ph),
    }));
  }, [history]);

  // Prepare data for Comparison (Current Input vs Top Crop Optimal Mid-points)
  const comparisonData = useMemo(() => {
    if (!currentResult) return [];
    
    const topCrop = CROP_RANGES.find(r => r.crop === currentResult.final.crop);
    if (!topCrop) return [];

    const params = [
      { name: 'Nito', key: 'N', min: topCrop.N_min, max: topCrop.N_max, current: Number(currentInput.N) },
      { name: 'Phốt pho', key: 'P', min: topCrop.P_min, max: topCrop.P_max, current: Number(currentInput.P) },
      { name: 'Kali', key: 'K', min: topCrop.K_min, max: topCrop.K_max, current: Number(currentInput.K) },
      { name: 'Độ pH', key: 'ph', min: topCrop.ph_min, max: topCrop.ph_max, current: Number(currentInput.ph) },
    ];

    return params.map(p => {
      const mid = (p.min + p.max) / 2;
      // Normalize values for Radar Chart (0-100 scale)
      // This is a simplified normalization for visualization
      const normalize = (val: number, key: string) => {
        if (key === 'ph') return (val / 14) * 100;
        return (val / 200) * 100; // Assuming 200 is a reasonable max for N, P, K
      };

      return {
        subject: p.name,
        Thực_tế: normalize(p.current, p.key),
        Lý_tưởng: normalize(mid, p.key),
        fullMark: 100,
      };
    });
  }, [currentResult, currentInput]);

  if (history.length < 2 && !currentResult) return null;

  return (
    <div className="mt-12 space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-agro-green p-2 rounded-xl text-white">
          <BarChart3 size={24} />
        </div>
        <h2 className="text-3xl font-black text-agro-dark">Phân tích & Thống kê</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trend Analysis */}
        {history.length >= 2 && (
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-8">
              <Activity className="text-agro-green" size={20} />
              <h4 className="font-bold text-gray-800">Xu hướng dinh dưỡng đất</h4>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
                  <Line type="monotone" dataKey="N" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} name="Nito" />
                  <Line type="monotone" dataKey="P" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} name="Phốt pho" />
                  <Line type="monotone" dataKey="K" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} activeDot={{ r: 6 }} name="Kali" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Suitability Comparison */}
        {currentResult && (
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-8">
              <Target className="text-agro-green" size={20} />
              <h4 className="font-bold text-gray-800">Hồ sơ đất vs {currentResult.final.crop}</h4>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={comparisonData}>
                  <PolarGrid stroke="#f0f0f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fontWeight: 'bold', fill: '#4b5563' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Đất thực tế"
                    dataKey="Thực_tế"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="Ngưỡng lý tưởng"
                    dataKey="Lý_tưởng"
                    stroke="#1f2937"
                    fill="#1f2937"
                    fillOpacity={0.1}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

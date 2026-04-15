import React from 'react';
import { Tractor, FlaskConical, Droplets, Thermometer, Sun, CloudRain, Leaf, TestTube, History, Trash2 } from 'lucide-react';
import { InputGroup } from './InputGroup';
import { CropInput, PredictionResult } from '../types';

interface SidebarProps {
  input: CropInput;
  setInput: React.Dispatch<React.SetStateAction<CropInput>>;
  onPredict: (e: React.FormEvent) => void;
  onClearError: (field: keyof CropInput) => void;
  errors: Partial<Record<keyof CropInput, string>>;
  history: { input: CropInput; result: PredictionResult; timestamp: number }[];
  onSelectHistory: (input: CropInput) => void;
  onClearHistory: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  input, 
  setInput, 
  onPredict, 
  onClearError, 
  errors,
  history,
  onSelectHistory,
  onClearHistory
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof CropInput]) {
      onClearError(name as keyof CropInput);
    }
  };

  return (
    <div className="bg-white rounded-[30px] p-6 shadow-sm border-none sticky top-8">
      <div className="flex items-center mb-6">
        <h5 className="text-lg font-bold text-gray-800">Thông số đất & Môi trường</h5>
        <Tractor className="ml-auto text-agro-green w-6 h-6" />
      </div>

      <form onSubmit={onPredict} noValidate>
        <InputGroup
          label="Nito (N)"
          name="N"
          placeholder="Ví dụ: 40"
          value={input.N}
          onChange={handleChange}
          onClearError={() => onClearError('N')}
          icon={<Leaf size={20} />}
          error={errors.N}
          tooltip="Nito giúp phát triển lá và thân. Khoảng tối ưu: 0-200."
        />

        <div className="grid grid-cols-2 gap-4">
          <InputGroup
            label="Phốt pho (P)"
            name="P"
            placeholder="Ph"
            value={input.P}
            onChange={handleChange}
            onClearError={() => onClearError('P')}
            icon={<FlaskConical size={20} />}
            error={errors.P}
            tooltip="Phốt pho giúp phát triển rễ và hoa. Khoảng tối ưu: 0-200."
          />
          <InputGroup
            label="Kali (K)"
            name="K"
            placeholder="Kali"
            value={input.K}
            onChange={handleChange}
            onClearError={() => onClearError('K')}
            icon={<Droplets size={20} />}
            error={errors.K}
            tooltip="Kali giúp tăng cường sức đề kháng và chất lượng quả. Khoảng tối ưu: 0-300."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputGroup
            label="Nhiệt độ (°C)"
            name="temperature"
            placeholder="10"
            value={input.temperature}
            onChange={handleChange}
            onClearError={() => onClearError('temperature')}
            icon={<Thermometer size={20} />}
            error={errors.temperature}
            tooltip="Nhiệt độ ảnh hưởng đến quá trình trao đổi chất. Khoảng tối ưu: 10-40°C."
          />
          <InputGroup
            label="Độ ẩm (%)"
            name="humidity"
            placeholder="Độ ẩm"
            value={input.humidity}
            onChange={handleChange}
            onClearError={() => onClearError('humidity')}
            icon={<Sun size={20} />}
            error={errors.humidity}
            tooltip="Độ ẩm không khí ảnh hưởng đến sự thoát hơi nước. Khoảng tối ưu: 20-100%."
          />
        </div>

        <InputGroup
          label="Độ pH"
          name="ph"
          placeholder="9.0"
          value={input.ph}
          onChange={handleChange}
          onClearError={() => onClearError('ph')}
          step="0.1"
          icon={<TestTube size={20} />}
          error={errors.ph}
          tooltip="Độ pH quyết định khả năng hấp thụ dinh dưỡng. Khoảng tối ưu: 4-9."
        />

        <InputGroup
          label="Lượng mưa (mm)"
          name="rainfall"
          placeholder="Mưa"
          value={input.rainfall}
          onChange={handleChange}
          onClearError={() => onClearError('rainfall')}
          icon={<CloudRain size={20} />}
          error={errors.rainfall}
          tooltip="Lượng mưa cung cấp nước cho cây. Khoảng tối ưu: 20-1000mm."
        />

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#14452F] to-[#2D6A4F] hover:from-black hover:to-black text-white font-bold py-4 rounded-[18px] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl active:scale-95 mt-2 uppercase tracking-wider text-sm"
        >
          KHỞI TẠO DỰ ĐOÁN
        </button>
      </form>

      {/* History Section */}
      {history.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History size={18} className="text-gray-400" />
              <h6 className="text-sm font-bold text-gray-700">Lịch sử dự đoán</h6>
            </div>
            <button 
              onClick={onClearHistory}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Xóa lịch sử"
            >
              <Trash2 size={16} />
            </button>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {history.map((item, index) => (
              <button
                key={item.timestamp}
                onClick={() => onSelectHistory(item.input)}
                className="w-full text-left p-3 rounded-2xl bg-gray-50 hover:bg-agro-green/5 border border-transparent hover:border-agro-green/10 transition-all group"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-black text-agro-green uppercase">{item.result.crop}</span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 line-clamp-1">
                  N:{item.input.N} P:{item.input.P} K:{item.input.K} | pH:{item.input.ph}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

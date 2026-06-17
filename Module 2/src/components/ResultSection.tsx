import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FinalResult, PredictionResult } from '../types';
import { Wind, ListOrdered, CheckCircle2, Star, Leaf, X, Sun, Droplets, Bug, Sprout, Info, Medal, Thermometer, FlaskConical, CloudRain } from 'lucide-react';
import { CROP_RANGES } from '../constants';

interface ResultSectionProps {
  result: FinalResult | null;
  isLoading?: boolean;
}

export const ResultSection: React.FC<ResultSectionProps> = ({ result, isLoading }) => {
  const [selectedCrop, setSelectedCrop] = useState<PredictionResult | null>(null);

  const getCropRange = (cropName: string) => {
    return CROP_RANGES.find(r => r.crop === cropName);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 mt-12 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="bg-agro-green/10 p-8 rounded-full mb-6"
        >
          <Leaf className="w-20 h-20 text-agro-green" />
        </motion.div>
        <h3 className="text-2xl font-bold text-agro-dark mb-2">Đang phân tích AI...</h3>
        <p className="text-gray-600 max-w-md">Chúng tôi đang sử dụng Imagen API để tạo hình ảnh chất lượng cao cho các loại cây trồng phù hợp nhất.</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center p-12 mt-12 opacity-40 text-center">
        <div className="bg-agro-green/10 p-8 rounded-full mb-6">
          <Leaf className="w-20 h-20 text-agro-green" />
        </div>
        <h3 className="text-2xl font-bold text-agro-dark mb-2">Hệ thống đang sẵn sàng</h3>
        <p className="text-gray-600 max-w-md">Vui lòng nhập thông số đất và môi trường bên trái để bắt đầu phân tích AI.</p>
      </div>
    );
  }

  if (result.is_low_conf) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[40px] shadow-sm p-12 text-center"
      >
        <Wind className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Môi trường quá khắc nghiệt!</h2>
        <p className="text-gray-600 text-lg">Các chỉ số đo được không phù hợp để canh tác bất kỳ loại cây nào trong danh sách.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Result - Matching Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-[#14452F] via-[#1A5337] to-[#2D6A4F] rounded-[40px] shadow-2xl overflow-hidden text-white p-8 md:p-12 relative"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Left: Image */}
          <div className="relative w-48 h-48 md:w-64 md:h-64 shrink-0">
            <img
              src={result.final.image}
              alt={result.final.crop}
              className="w-full h-full object-cover rounded-[40px] shadow-2xl border-4 border-white/10"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                if (!img.dataset.triedFallback) {
                  img.dataset.triedFallback = 'true';
                  img.src = `https://picsum.photos/seed/${encodeURIComponent(result.final.crop)}/800/600`;
                } else {
                  img.src = `https://placehold.co/600x400/14452f/ffffff?text=${encodeURIComponent(result.final.crop)}+Image+Unavailable`;
                }
              }}
            />
          </div>

          {/* Center: Info */}
          <div className="flex-1 text-center md:text-left">
            <h6 className="text-sm md:text-base uppercase font-bold tracking-[0.2em] text-white/80 mb-3">Cây trồng đề xuất tốt nhất</h6>
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight leading-none">{result.final.crop}</h1>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <span className="text-2xl md:text-3xl font-bold text-white/90">Độ phù hợp: <span className="text-white">{result.final.accuracy}%</span></span>
              <button
                onClick={() => setSelectedCrop(result.final)}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white px-8 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-all group"
              >
                <Info size={18} className="group-hover:rotate-12 transition-transform" /> Xem chi tiết
              </button>
            </div>
          </div>

          {/* Right: Circular Progress */}
          <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-white/10"
              />
              <motion.circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray="439.8"
                initial={{ strokeDashoffset: 439.8 }}
                animate={{ strokeDashoffset: 439.8 - (439.8 * result.final.accuracy) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-white"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-black text-2xl">
              {Math.round(result.final.accuracy)}%
            </div>
          </div>
        </div>
      </motion.div>

      {/* Top 3 List - Matching Image */}
      <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h5 className="text-2xl font-extrabold text-gray-800">Danh sách Top 3 ứng viên hàng đầu</h5>
          </div>
          <div className="bg-agro-input p-2 rounded-xl">
            <Sprout className="text-agro-green w-6 h-6" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {result.top_3.map((item, idx) => (
            <motion.div
              key={item.crop}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-[30px] p-6 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group relative flex flex-col"
            >
              <div className="flex items-center gap-5 mb-8">
                <img
                  src={item.image}
                  alt={item.crop}
                  className="w-20 h-20 rounded-2xl object-cover shadow-lg group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (!img.dataset.triedFallback) {
                      img.dataset.triedFallback = 'true';
                      img.src = `https://picsum.photos/seed/${encodeURIComponent(item.crop)}/200/200`;
                    } else {
                      img.src = `https://placehold.co/100x100/2d6a4f/ffffff?text=${encodeURIComponent(item.crop)}`;
                    }
                  }}
                />
                <h5 className="font-black text-gray-800 text-xl leading-tight">{item.crop}</h5>
              </div>

              <div className="space-y-6 flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-800">Điểm Rule:</span>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5 text-yellow-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={16} fill={i < Math.floor(item.score / 3) ? "currentColor" : "none"} className={i < Math.floor(item.score / 3) ? "text-yellow-500" : "text-gray-200"} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 font-bold">{item.score.toFixed(2)}/15</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-gray-800">Độ phù hợp</span>
                    <span className="text-sm font-black text-agro-green">{item.accuracy}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.accuracy}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-agro-green rounded-full"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-bold text-gray-800">Trạng thái</span>
                  {item.accuracy === result.final.accuracy ? (
                    <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-xs font-bold flex items-center gap-2 shadow-md">
                      <div className="bg-yellow-400 p-1 rounded-full text-blue-600">
                        <Medal size={12} />
                      </div>
                      Best Choice
                    </div>
                  ) : (
                    <span className="px-4 py-2 bg-[#E9F5EE] text-agro-green rounded-full text-xs font-bold border border-agro-green/10">
                      Good Option
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedCrop(item)}
                className="mt-8 w-full py-4 rounded-2xl bg-gray-50 hover:bg-agro-dark hover:text-white text-agro-dark font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 border border-gray-100"
              >
                <Info size={18} /> Xem chi tiết
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedCrop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCrop(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="relative h-48 md:h-64">
                <img
                  src={selectedCrop.image}
                  alt={selectedCrop.crop}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (!img.dataset.triedFallback) {
                      img.dataset.triedFallback = 'true';
                      img.src = `https://picsum.photos/seed/${encodeURIComponent(selectedCrop.crop)}/800/600`;
                    } else {
                      img.src = `https://placehold.co/600x400/14452f/ffffff?text=${encodeURIComponent(selectedCrop.crop)}+Image+Unavailable`;
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <button
                  onClick={() => setSelectedCrop(null)}
                  className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all"
                >
                  <X size={24} />
                </button>
                <div className="absolute bottom-8 left-8 text-white">
                  <h2 className="text-4xl font-black mb-2">{selectedCrop.crop}</h2>
                  <div className="flex items-center gap-2 bg-agro-green px-4 py-1 rounded-full text-xs font-bold w-fit">
                    <CheckCircle2 size={14} /> Độ phù hợp: {selectedCrop.accuracy}%
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar">
                {/* Section 1: Environmental Ranges */}
                {getCropRange(selectedCrop.crop) && (
                  <div className="mb-10">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-agro-green rounded-full" />
                      Thông số môi trường lý tưởng
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Nito', val: `${getCropRange(selectedCrop.crop)?.N_min}-${getCropRange(selectedCrop.crop)?.N_max}`, icon: <Leaf size={16} />, color: 'bg-green-50 text-green-600' },
                        { label: 'Phốt pho', val: `${getCropRange(selectedCrop.crop)?.P_min}-${getCropRange(selectedCrop.crop)?.P_max}`, icon: <FlaskConical size={16} />, color: 'bg-blue-50 text-blue-600' },
                        { label: 'Kali', val: `${getCropRange(selectedCrop.crop)?.K_min}-${getCropRange(selectedCrop.crop)?.K_max}`, icon: <Droplets size={16} />, color: 'bg-orange-50 text-orange-600' },
                        { label: 'Độ pH', val: `${getCropRange(selectedCrop.crop)?.ph_min}-${getCropRange(selectedCrop.crop)?.ph_max}`, icon: <FlaskConical size={16} />, color: 'bg-purple-50 text-purple-600' },
                        { label: 'Nhiệt độ', val: `${getCropRange(selectedCrop.crop)?.temp_min}-${getCropRange(selectedCrop.crop)?.temp_max}°C`, icon: <Thermometer size={16} />, color: 'bg-red-50 text-red-600' },
                        { label: 'Độ ẩm', val: `${getCropRange(selectedCrop.crop)?.humidity_min}-${getCropRange(selectedCrop.crop)?.humidity_max}%`, icon: <Sun size={16} />, color: 'bg-yellow-50 text-yellow-600' },
                        { label: 'Lượng mưa', val: `${getCropRange(selectedCrop.crop)?.rain_min}-${getCropRange(selectedCrop.crop)?.rain_max}mm`, icon: <CloudRain size={16} />, color: 'bg-indigo-50 text-indigo-600' },
                      ].map((stat, i) => (
                        <div key={i} className={`${stat.color} p-3 rounded-2xl flex flex-col items-center text-center gap-1`}>
                          <div className="mb-1">{stat.icon}</div>
                          <span className="text-[10px] font-bold uppercase opacity-70">{stat.label}</span>
                          <span className="text-sm font-black">{stat.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-agro-green rounded-full" />
                  Điều kiện & Kỹ thuật canh tác
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="bg-orange-50 p-3 rounded-2xl text-orange-500 h-fit">
                        <Sun size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 mb-1">Ánh sáng</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{selectedCrop.details.light}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="bg-blue-50 p-3 rounded-2xl text-blue-500 h-fit">
                        <Droplets size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 mb-1">Loại đất</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{selectedCrop.details.soil}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="bg-red-50 p-3 rounded-2xl text-red-500 h-fit">
                        <Bug size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 mb-1">Sâu bệnh thường gặp</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{selectedCrop.details.pests}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="bg-green-50 p-3 rounded-2xl text-agro-green h-fit">
                        <Sprout size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 mb-1">Kỹ thuật chăm sóc</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{selectedCrop.details.care}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10 pt-8 border-t border-gray-100">
                  <button
                    onClick={() => setSelectedCrop(null)}
                    className="w-full py-4 bg-agro-dark text-white rounded-2xl font-bold hover:bg-black transition-all"
                  >
                    Đóng thông tin
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

import { CropRange } from './types';

export const CROP_RANGES: CropRange[] = [
  {
    crop: "Rice",
    N_min: 60, N_max: 100,
    P_min: 30, P_max: 60,
    K_min: 30, K_max: 50,
    temp_min: 20, temp_max: 30,
    humidity_min: 70, humidity_max: 90,
    ph_min: 5.5, ph_max: 7.0,
    rain_min: 150, rain_max: 300,
    details: {
      light: "Ánh sáng mặt trời trực tiếp (ít nhất 6-8 giờ/ngày).",
      soil: "Đất sét hoặc đất thịt pha sét giữ nước tốt.",
      pests: "Sâu cuốn lá, rầy nâu, bệnh đạo ôn.",
      care: "Giữ mực nước ổn định, bón phân đúng giai đoạn sinh trưởng."
    }
  },
  {
    crop: "Maize",
    N_min: 60, N_max: 120,
    P_min: 30, P_max: 60,
    K_min: 15, K_max: 25,
    temp_min: 18, temp_max: 35,
    humidity_min: 50, humidity_max: 80,
    ph_min: 5.5, ph_max: 7.5,
    rain_min: 60, rain_max: 110,
    details: {
      light: "Ánh sáng mặt trời đầy đủ.",
      soil: "Đất thịt pha cát, thoát nước tốt, giàu hữu cơ.",
      pests: "Sâu đục thân, sâu keo mùa thu, bệnh rỉ sắt.",
      care: "Tưới nước đều đặn, đặc biệt là giai đoạn trổ cờ và làm hạt."
    }
  },
  {
    crop: "Chickpea",
    N_min: 20, N_max: 60,
    P_min: 40, P_max: 80,
    K_min: 60, K_max: 100,
    temp_min: 15, temp_max: 25,
    humidity_min: 15, humidity_max: 20,
    ph_min: 6.0, ph_max: 8.5,
    rain_min: 60, rain_max: 100,
    details: {
      light: "Ánh sáng mặt trời đầy đủ.",
      soil: "Đất thịt nhẹ, thoát nước cực tốt.",
      pests: "Sâu đục quả, bệnh héo rũ.",
      care: "Tránh tưới quá nhiều nước gây úng rễ, bón lót lân đầy đủ."
    }
  },
  {
    crop: "Kidneybeans",
    N_min: 10, N_max: 40,
    P_min: 40, P_max: 70,
    K_min: 15, K_max: 25,
    temp_min: 15, temp_max: 25,
    humidity_min: 18, humidity_max: 25,
    ph_min: 5.5, ph_max: 6.0,
    rain_min: 60, rain_max: 150,
    details: {
      light: "Ánh sáng mặt trời đầy đủ.",
      soil: "Đất thịt pha cát, pH hơi acid.",
      pests: "Rệp muội, sâu đục quả, bệnh lở cổ rễ.",
      care: "Cần giàn leo nếu là giống leo, tưới nước vào gốc tránh làm ướt lá."
    }
  },
  {
    crop: "Pigeonpeas",
    N_min: 0, N_max: 40,
    P_min: 40, P_max: 80,
    K_min: 15, K_max: 25,
    temp_min: 18, temp_max: 35,
    humidity_min: 30, humidity_max: 70,
    ph_min: 4.5, ph_max: 7.5,
    rain_min: 90, rain_max: 200,
    details: {
      light: "Ánh sáng mặt trời đầy đủ.",
      soil: "Chịu được nhiều loại đất, kể cả đất nghèo dinh dưỡng.",
      pests: "Sâu đục quả, rầy mềm.",
      care: "Cây chịu hạn tốt, không cần tưới quá nhiều sau khi đã bén rễ."
    }
  },
  {
    crop: "Mothbeans",
    N_min: 0, N_max: 40,
    P_min: 40, P_max: 70,
    K_min: 15, K_max: 25,
    temp_min: 24, temp_max: 30,
    humidity_min: 40, humidity_max: 65,
    ph_min: 3.5, ph_max: 10.0,
    rain_min: 30, rain_max: 75,
    details: {
      light: "Ánh sáng mặt trời đầy đủ.",
      soil: "Đất cát, chịu được đất mặn và kiềm.",
      pests: "Sâu ăn lá, bệnh khảm vàng.",
      care: "Cực kỳ chịu hạn, phù hợp cho vùng khô hạn."
    }
  },
  {
    crop: "Mungbean",
    N_min: 0, N_max: 40,
    P_min: 35, P_max: 60,
    K_min: 15, K_max: 25,
    temp_min: 27, temp_max: 30,
    humidity_min: 80, humidity_max: 90,
    ph_min: 6.0, ph_max: 7.5,
    rain_min: 35, rain_max: 60,
    details: {
      light: "Ánh sáng mặt trời đầy đủ.",
      soil: "Đất thịt pha cát, thoát nước tốt.",
      pests: "Sâu đục quả, bọ trĩ.",
      care: "Thời gian sinh trưởng ngắn, cần làm cỏ thường xuyên giai đoạn đầu."
    }
  },
  {
    crop: "Blackgram",
    N_min: 20, N_max: 60,
    P_min: 60, P_max: 80,
    K_min: 15, K_max: 25,
    temp_min: 25, temp_max: 35,
    humidity_min: 60, humidity_max: 70,
    ph_min: 6.5, ph_max: 7.5,
    rain_min: 60, rain_max: 75,
    details: {
      light: "Ánh sáng mặt trời đầy đủ.",
      soil: "Đất thịt nặng, giữ ẩm tốt.",
      pests: "Sâu khoang, bệnh phấn trắng.",
      care: "Cần độ ẩm ổn định giai đoạn ra hoa."
    }
  },
  {
    crop: "Lentil",
    N_min: 0, N_max: 40,
    P_min: 35, P_max: 60,
    K_min: 15, K_max: 25,
    temp_min: 18, temp_max: 30,
    humidity_min: 60, humidity_max: 70,
    ph_min: 5.5, ph_max: 7.5,
    rain_min: 35, rain_max: 55,
    details: {
      light: "Ánh sáng mặt trời đầy đủ.",
      soil: "Đất thịt pha cát, thoát nước tốt.",
      pests: "Sâu đục quả, bệnh héo rũ.",
      care: "Phù hợp khí hậu mát mẻ, tránh úng nước."
    }
  },
  {
    crop: "Pomegranate",
    N_min: 0, N_max: 40,
    P_min: 5, P_max: 30,
    K_min: 35, K_max: 45,
    temp_min: 18, temp_max: 25,
    humidity_min: 85, humidity_max: 95,
    ph_min: 5.5, ph_max: 7.5,
    rain_min: 100, rain_max: 115,
    details: {
      light: "Ánh sáng mặt trời trực tiếp.",
      soil: "Đất thịt sâu, thoát nước tốt.",
      pests: "Sâu đục quả, rệp sáp.",
      care: "Cắt tỉa cành định kỳ, bón phân hữu cơ."
    }
  },
  {
    crop: "Banana",
    N_min: 80, N_max: 120,
    P_min: 70, P_max: 95,
    K_min: 45, K_max: 55,
    temp_min: 25, temp_max: 30,
    humidity_min: 75, humidity_max: 85,
    ph_min: 5.5, ph_max: 6.5,
    rain_min: 90, rain_max: 115,
    details: {
      light: "Ánh sáng mặt trời đầy đủ, tránh gió mạnh.",
      soil: "Đất thịt sâu, giàu mùn, thoát nước tốt.",
      pests: "Sâu đục thân, bệnh héo rũ Panama.",
      care: "Cần rất nhiều nước và phân bón (đặc biệt là Kali)."
    }
  },
  {
    crop: "Mango",
    N_min: 0, N_max: 40,
    P_min: 15, P_max: 40,
    K_min: 25, K_max: 35,
    temp_min: 27, temp_max: 35,
    humidity_min: 45, humidity_max: 55,
    ph_min: 4.5, ph_max: 7.0,
    rain_min: 90, rain_max: 105,
    details: {
      light: "Ánh sáng mặt trời trực tiếp.",
      soil: "Đất thịt pha cát, tầng đất dày.",
      pests: "Rầy bông xoài, ruồi đục quả.",
      care: "Tưới nước giai đoạn cây con, xử lý ra hoa vụ nghịch."
    }
  },
  {
    crop: "Grapes",
    N_min: 0, N_max: 40,
    P_min: 120, P_max: 145,
    K_min: 195, K_max: 205,
    temp_min: 7, temp_max: 42,
    humidity_min: 80, humidity_max: 85,
    ph_min: 5.5, ph_max: 6.5,
    rain_min: 65, rain_max: 75,
    details: {
      light: "Ánh sáng mặt trời đầy đủ.",
      soil: "Đất cát hoặc đất thịt pha cát, thoát nước cực tốt.",
      pests: "Rệp sáp, bệnh sương mai.",
      care: "Cần giàn leo chắc chắn, cắt tỉa cành rất quan trọng để đậu quả."
    }
  },
  {
    crop: "Watermelon",
    N_min: 80, N_max: 120,
    P_min: 5, P_max: 30,
    K_min: 45, K_max: 55,
    temp_min: 24, temp_max: 27,
    humidity_min: 80, humidity_max: 90,
    ph_min: 6.0, ph_max: 7.0,
    rain_min: 40, rain_max: 60,
    details: {
      light: "Ánh sáng mặt trời đầy đủ.",
      soil: "Đất cát giàu hữu cơ.",
      pests: "Bọ dưa, bệnh héo rũ.",
      care: "Tưới nước đều đặn giai đoạn đầu, giảm tưới khi quả chín để tăng độ ngọt."
    }
  },
  {
    crop: "Muskmelon",
    N_min: 80, N_max: 120,
    P_min: 5, P_max: 30,
    K_min: 45, K_max: 55,
    temp_min: 27, temp_max: 30,
    humidity_min: 90, humidity_max: 95,
    ph_min: 6.0, ph_max: 7.0,
    rain_min: 20, rain_max: 30,
    details: {
      light: "Ánh sáng mặt trời đầy đủ.",
      soil: "Đất thịt nhẹ hoặc đất cát.",
      pests: "Rầy mềm, bệnh phấn trắng.",
      care: "Cần không gian rộng để bò hoặc làm giàn treo quả."
    }
  },
  {
    crop: "Apple",
    N_min: 0, N_max: 40,
    P_min: 120, P_max: 145,
    K_min: 195, K_max: 205,
    temp_min: 21, temp_max: 24,
    humidity_min: 90, humidity_max: 95,
    ph_min: 5.5, ph_max: 6.5,
    rain_min: 100, rain_max: 125,
    details: {
      light: "Ánh sáng mặt trời đầy đủ.",
      soil: "Đất thịt màu mỡ, thoát nước tốt.",
      pests: "Sâu đục quả, bệnh ghẻ táo.",
      care: "Cần khí hậu lạnh để phân hóa mầm hoa, cắt tỉa hàng năm."
    }
  },
  {
    crop: "Orange",
    N_min: 0, N_max: 40,
    P_min: 5, P_max: 30,
    K_min: 5, K_max: 15,
    temp_min: 10, temp_max: 40,
    humidity_min: 90, humidity_max: 95,
    ph_min: 6.0, ph_max: 8.0,
    rain_min: 100, rain_max: 120,
    details: {
      light: "Ánh sáng mặt trời đầy đủ.",
      soil: "Đất thịt pha cát, giàu dinh dưỡng.",
      pests: "Sâu vẽ bùa, bệnh loét cam.",
      care: "Bón phân cân đối, tưới nước đủ ẩm nhưng không úng."
    }
  },
  {
    crop: "Papaya",
    N_min: 30, N_max: 70,
    P_min: 45, P_max: 70,
    K_min: 45, K_max: 55,
    temp_min: 23, temp_max: 45,
    humidity_min: 90, humidity_max: 95,
    ph_min: 6.5, ph_max: 7.0,
    rain_min: 150, rain_max: 255,
    details: {
      light: "Ánh sáng mặt trời đầy đủ.",
      soil: "Đất thịt nhẹ, thoát nước cực tốt.",
      pests: "Rệp sáp, bệnh khảm virus.",
      care: "Rễ rất nhạy cảm với ngập úng, cần vun gốc cao."
    }
  },
  {
    crop: "Coconut",
    N_min: 0, N_max: 40,
    P_min: 5, P_max: 30,
    K_min: 25, K_max: 35,
    temp_min: 25, temp_max: 30,
    humidity_min: 90, humidity_max: 100,
    ph_min: 5.5, ph_max: 6.5,
    rain_min: 130, rain_max: 230,
    details: {
      light: "Ánh sáng mặt trời trực tiếp.",
      soil: "Đất cát ven biển hoặc đất thịt pha cát.",
      pests: "Bọ vòi voi, kiến vương.",
      care: "Chịu được mặn, cần nhiều nước và ánh sáng."
    }
  },
  {
    crop: "Cotton",
    N_min: 100, N_max: 140,
    P_min: 35, P_max: 60,
    K_min: 15, K_max: 25,
    temp_min: 22, temp_max: 26,
    humidity_min: 75, humidity_max: 85,
    ph_min: 5.5, ph_max: 8.0,
    rain_min: 60, rain_max: 100,
    details: {
      light: "Ánh sáng mặt trời đầy đủ.",
      soil: "Đất đen hoặc đất thịt sâu.",
      pests: "Sâu xanh, rầy xanh.",
      care: "Cần mùa khô kéo dài khi quả chín để thu hoạch bông."
    }
  },
  {
    crop: "Jute",
    N_min: 60, N_max: 100,
    P_min: 35, P_max: 60,
    K_min: 35, K_max: 45,
    temp_min: 23, temp_max: 27,
    humidity_min: 70, humidity_max: 90,
    ph_min: 6.0, ph_max: 7.5,
    rain_min: 150, rain_max: 200,
    details: {
      light: "Ánh sáng mặt trời đầy đủ.",
      soil: "Đất phù sa bồi đắp hàng năm.",
      pests: "Sâu ăn lá, bệnh thối thân.",
      care: "Cần độ ẩm cao và lượng mưa lớn giai đoạn sinh trưởng."
    }
  },
  {
    crop: "Coffee",
    N_min: 80, N_max: 120,
    P_min: 15, P_max: 40,
    K_min: 30, K_max: 40,
    temp_min: 23, temp_max: 28,
    humidity_min: 50, humidity_max: 65,
    ph_min: 6.0, ph_max: 7.5,
    rain_min: 115, rain_max: 200,
    details: {
      light: "Ánh sáng tán xạ hoặc che bóng một phần.",
      soil: "Đất đỏ Bazan giàu dinh dưỡng.",
      pests: "Mọt đục quả, bệnh rỉ sắt.",
      care: "Cần mùa khô để phân hóa mầm hoa và thu hoạch."
    }
  }
];

export interface CropInput {
  N: number | string;
  P: number | string;
  K: number | string;
  temperature: number | string;
  humidity: number | string;
  ph: number | string;
  rainfall: number | string;
}

export interface NumericCropInput {
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
}

export interface CropDetails {
  light: string;
  soil: string;
  pests: string;
  care: string;
}

export interface CropRange {
  crop: string;
  N_min: number;
  N_max: number;
  P_min: number;
  P_max: number;
  K_min: number;
  K_max: number;
  temp_min: number;
  temp_max: number;
  humidity_min: number;
  humidity_max: number;
  ph_min: number;
  ph_max: number;
  rain_min: number;
  rain_max: number;
  details: CropDetails;
}

export interface PredictionResult {
  crop: string;
  score: number;
  accuracy: number;
  image: string;
  details: CropDetails;
}

export interface FinalResult {
  final: PredictionResult;
  top_3: PredictionResult[];
  is_low_conf: boolean;
}

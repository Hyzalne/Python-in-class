from flask import Flask, render_template, request, session, redirect, url_for
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import os
import json
from datetime import datetime
from urllib.parse import quote
from urllib.request import urlopen, Request

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "agrosmart-local-secret-key")

# Fields expected from the form
FIELD_LABELS = {
    'N': 'Nito (N)',
    'P': 'Phốt pho (P)',
    'K': 'Kali (K)',
    'temperature': 'Nhiệt độ',
    'humidity': 'Độ ẩm',
    'ph': 'Độ pH',
    'rainfall': 'Lượng mưa'
}

RANGE_COLUMNS = [
    "N_min", "N_max", "P_min", "P_max", "K_min", "K_max",
    "temp_min", "temp_max", "humidity_min", "humidity_max",
    "ph_min", "ph_max", "rain_min", "rain_max"
]

HARD_INPUT_LIMITS = {
    "N": (0, 400),
    "P": (0, 400),
    "K": (0, 400),
    "temperature": (-20, 70),
    "humidity": (0, 100),
    "ph": (0, 14),
    "rainfall": (0, 500)
}

SCORING_CONFIG = {
    "N": {"min_col": "N_min", "max_col": "N_max", "weight": 2.0},
    "P": {"min_col": "P_min", "max_col": "P_max", "weight": 2.0},
    "K": {"min_col": "K_min", "max_col": "K_max", "weight": 2.0},
    "rainfall": {"min_col": "rain_min", "max_col": "rain_max", "weight": 2.0},
    "temperature": {"min_col": "temp_min", "max_col": "temp_max", "weight": 1.0},
    "humidity": {"min_col": "humidity_min", "max_col": "humidity_max", "weight": 1.0},
    "ph": {"min_col": "ph_min", "max_col": "ph_max", "weight": 1.0}
}

def load_crop_details():
    json_path = os.path.join(os.path.dirname(__file__), "crop_details.json")
    if not os.path.exists(json_path):
        return {}

    try:
        with open(json_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return {}


CROP_DETAILS = load_crop_details()
_IMAGE_CACHE = {}


def get_data_file_path(filename):
    base_dir = os.path.dirname(__file__)
    candidate_paths = [
        os.path.join(base_dir, filename),
        os.path.join(os.path.dirname(base_dir), filename),
        os.path.join(os.path.dirname(os.path.dirname(base_dir)), filename),
    ]

    for path in candidate_paths:
        if os.path.exists(path):
            return path
    return candidate_paths[0]


def load_export_crop_data():
    csv_path = get_data_file_path("export_crops.csv")
    if not os.path.exists(csv_path):
        return pd.DataFrame()

    try:
        df = pd.read_csv(csv_path)
    except Exception:
        return pd.DataFrame()

    normalized_columns = {
        "Crop Name": "crop",
        "Temp_min": "temp_min",
        "Temp_max": "temp_max",
        "Humidity_min": "humidity_min",
        "Humidity_max": "humidity_max",
        "pH_min": "ph_min",
        "pH_max": "ph_max",
        "Rain_min": "rain_min",
        "Rain_max": "rain_max",
        "Light": "light",
        "Soil": "soil",
        "Pests": "pests",
        "Care": "care",
    }
    df = df.rename(columns=normalized_columns)
    return df


def prepare_range_dataframe(df):
    if df is None or df.empty:
        return pd.DataFrame()

    cleaned_df = df.copy()
    if "crop" in cleaned_df.columns:
        cleaned_df["crop"] = cleaned_df["crop"].astype(str).str.strip()

    for col in RANGE_COLUMNS:
        if col in cleaned_df.columns:
            cleaned_df[col] = pd.to_numeric(cleaned_df[col], errors="coerce")

    available_required = [col for col in RANGE_COLUMNS if col in cleaned_df.columns]
    if available_required:
        cleaned_df = cleaned_df.dropna(subset=available_required)

    min_max_pairs = [
        ("N_min", "N_max"), ("P_min", "P_max"), ("K_min", "K_max"),
        ("temp_min", "temp_max"), ("humidity_min", "humidity_max"),
        ("ph_min", "ph_max"), ("rain_min", "rain_max")
    ]
    for min_col, max_col in min_max_pairs:
        if min_col not in cleaned_df.columns or max_col not in cleaned_df.columns:
            continue
        swap_mask = cleaned_df[min_col] > cleaned_df[max_col]
        if swap_mask.any():
            tmp_vals = cleaned_df.loc[swap_mask, min_col].copy()
            cleaned_df.loc[swap_mask, min_col] = cleaned_df.loc[swap_mask, max_col]
            cleaned_df.loc[swap_mask, max_col] = tmp_vals

    return cleaned_df.reset_index(drop=True)

# --- 1. TRAIN ML MODEL ---
def train_model():
    crop_data_path = get_data_file_path('crop_data.csv')
    if not os.path.exists(crop_data_path):
        # Nếu chưa có data, gọi script tạo data (đã có ở bước trước)
        from data_setup import generate_data
        generate_data()
    
    df = pd.read_csv(crop_data_path)
    X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
    y = df['crop']
    model = RandomForestClassifier(
        n_estimators=300,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X, y)
    return model

model = train_model()
df_range = prepare_range_dataframe(pd.read_csv(get_data_file_path('crop_range.csv')))
df_export = prepare_range_dataframe(load_export_crop_data())
df_scoring = df_export if not df_export.empty else df_range

# --- 2. IMAGE HELPER ---
def get_crop_image(crop_name):
    crop_key = str(crop_name).strip().lower()
    if crop_key in _IMAGE_CACHE:
        return _IMAGE_CACHE[crop_key]

    wiki_title_map = {
        "kidneybeans": "Kidney bean",
        "mothbeans": "Moth bean",
        "mungbean": "Mung bean",
        "blackgram": "Vigna mungo",
        "pigeonpeas": "Pigeon pea",
        "muskmelon": "Cucumis melo",
        "papaya": "Papaya",
        "jute": "Jute",
        "coffee": "Coffee",
    }
    botanical_keywords = {
        "plant", "fruit", "tree", "crop", "species", "legume", "herb",
        "shrub", "flowering", "vine", "vegetable", "citrus", "grass", "bean"
    }

    def is_likely_plant_page(summary_data):
        description = str(summary_data.get("description", "")).lower()
        extract = str(summary_data.get("extract", "")).lower()
        text = f"{description} {extract}"
        return any(keyword in text for keyword in botanical_keywords)

    def fetch_summary_image(title):
        summary_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{quote(title)}"
        req = Request(summary_url, headers={"User-Agent": "AgroSmart/1.0"})
        with urlopen(req, timeout=3) as response:
            data = json.loads(response.read().decode("utf-8"))
            image_url = data.get("thumbnail", {}).get("source") or data.get("originalimage", {}).get("source")
            if image_url and is_likely_plant_page(data):
                return image_url
        return None

    base_title = wiki_title_map.get(crop_key, str(crop_name).strip())
    candidate_titles = [
        base_title,
        f"{base_title} (plant)",
        f"{base_title} (fruit)",
        f"{base_title} (tree)",
        f"{base_title} (species)"
    ]

    for title in candidate_titles:
        try:
            image_url = fetch_summary_image(title)
            if image_url:
                _IMAGE_CACHE[crop_key] = image_url
                return image_url
        except Exception:
            continue

    # Stable fallback image; stays consistent per crop name.
    fallback_url = f"https://picsum.photos/seed/{quote(crop_key)}/400/300"
    _IMAGE_CACHE[crop_key] = fallback_url
    return fallback_url

def get_crop_details(crop_name):
    default_details = {
        "light": "Can anh sang tu nhien on dinh, toi thieu 5-6 gio/ngay.",
        "soil": "Dat toi xop, giau huu co, thoat nuoc tot.",
        "pests": "Co the gap rep, sau an la va mot so benh nam theo mua.",
        "care": "Tuoi deu, bon phan can doi NPK, theo doi sau benh hang tuan."
    }
    crop_key = str(crop_name).strip().lower()

    if not df_export.empty and "crop" in df_export.columns:
        selected = df_export[df_export["crop"].astype(str).str.strip().str.lower() == crop_key]
        if not selected.empty:
            row = selected.iloc[0]
            export_details = {
                "light": str(row.get("light", "")).strip(),
                "soil": str(row.get("soil", "")).strip(),
                "pests": str(row.get("pests", "")).strip(),
                "care": str(row.get("care", "")).strip()
            }
            if all(export_details.values()):
                return export_details

    return CROP_DETAILS.get(crop_key, default_details)

def get_crop_range_row(crop_name):
    crop_key = str(crop_name).strip().lower()
    selected = df_scoring[df_scoring["crop"].astype(str).str.lower() == crop_key]
    if selected.empty:
        return None
    return selected.iloc[0]

def get_ideal_profile(crop_name):
    row = get_crop_range_row(crop_name)
    if row is None:
        return {}
    return {
        "N": round((row["N_min"] + row["N_max"]) / 2, 1),
        "P": round((row["P_min"] + row["P_max"]) / 2, 1),
        "K": round((row["K_min"] + row["K_max"]) / 2, 1),
        "temperature": round((row["temp_min"] + row["temp_max"]) / 2, 1),
        "humidity": round((row["humidity_min"] + row["humidity_max"]) / 2, 1),
        "ph": round((row["ph_min"] + row["ph_max"]) / 2, 1),
        "rainfall": round((row["rain_min"] + row["rain_max"]) / 2, 1)
    }


def get_detail_ranges(crop_name):
    row = get_crop_range_row(crop_name)
    if row is None:
        return {}

    return {
        "N": {"min": round(float(row["N_min"]), 1), "max": round(float(row["N_max"]), 1)},
        "P": {"min": round(float(row["P_min"]), 1), "max": round(float(row["P_max"]), 1)},
        "K": {"min": round(float(row["K_min"]), 1), "max": round(float(row["K_max"]), 1)},
        "temperature": {"min": round(float(row["temp_min"]), 1), "max": round(float(row["temp_max"]), 1)},
        "humidity": {"min": round(float(row["humidity_min"]), 1), "max": round(float(row["humidity_max"]), 1)},
        "ph": {"min": round(float(row["ph_min"]), 1), "max": round(float(row["ph_max"]), 1)},
        "rainfall": {"min": round(float(row["rain_min"]), 1), "max": round(float(row["rain_max"]), 1)}
    }

def get_status_for_metric(value, min_value, max_value):
    if value < min_value:
        return "Thiếu"
    if value > max_value:
        return "Dư"
    return "Đạt"


def build_input_hints():
    source_df = df_scoring
    if source_df.empty:
        return {}

    # Cập nhật dictionary: thêm phần mô tả (description) cho từng loại
    field_to_columns = {
        "N": {
            "cols": ("N_min", "N_max", "mg/kg"),
            "desc": "Nito là thành phần quan trọng của diệp lục, giúp cây phát triển xanh tốt, thúc đẩy tăng trưởng lá và thân."
        },
        "P": {
            "cols": ("P_min", "P_max", "mg/kg"),
            "desc": "Phốt pho kích thích phát triển bộ rễ mạnh mẽ và hỗ trợ quá trình ra hoa, đậu quả."
        },
        "K": {
            "cols": ("K_min", "K_max", "mg/kg"),
            "desc": "Kali giúp cây điều tiết nước, tăng sức đề kháng với sâu bệnh và cải thiện chất lượng nông sản."
        },
        "temperature": {
            "cols": ("temp_min", "temp_max", "°C"),
            "desc": "Nhiệt độ ảnh hưởng tới tốc độ quang hợp. Đa số cây trồng nhiệt đới phát triển tốt nhất trong khoảng 18°C - 35°C."
        },
        "humidity": {
            "cols": ("humidity_min", "humidity_max", "%"),
            "desc": "Độ ẩm không khí cao giúp cây giảm mất nước, nhưng rễ cần đất thông thoáng."
        },
        "ph": {
            "cols": ("ph_min", "ph_max", ""),
            "desc": "Độ pH quyết định khả năng hòa tan dinh dưỡng trong đất. Mức 5.5 - 7.5 (hơi chua đến trung tính) là tốt nhất cho đa số cây."
        },
        "rainfall": {
            "cols": ("rain_min", "rain_max", "mm"),
            "desc": "Nước giúp vận chuyển dinh dưỡng từ đất lên cây."
        }
    }

    hints = {}
    for field, info in field_to_columns.items():
        min_col, max_col, unit = info["cols"]
        description = info["desc"]

        if min_col not in source_df.columns or max_col not in source_df.columns:
            continue

        min_value = float(source_df[min_col].min())
        max_value = float(source_df[max_col].max())

        # Giới hạn pH
        if field == "ph":
            min_value = max(0, min_value)
            max_value = min(14, max_value)

        # Tạo chuỗi gợi ý kết hợp mô tả và khoảng lý tưởng
        range_text = f"Khoảng lý tưởng thường từ {round(min_value, 1)} - {round(max_value, 1)}{unit}."
        
        # Kết hợp nội dung theo format bạn muốn
        hints[field] = f"{description} {range_text}"

    return hints

def build_analysis(user_data, crop_name):
    row = get_crop_range_row(crop_name)
    if row is None:
        # Trả về dữ liệu mặc định nếu không tìm thấy crop
        return {
            "ideal": {"N": 0, "P": 0, "K": 0, "ph": 0},
            "nutrient_review": [],
            "radar_labels": ["Nito", "Phốt pho", "Kali", "Độ pH"],
            "ideal_radar": [0, 0, 0, 0],
            "actual_radar": [user_data.get("N", 0), user_data.get("P", 0), user_data.get("K", 0), user_data.get("ph", 0)],
            "radar_labels_json": json.dumps(["Nito", "Phốt pho", "Kali", "Độ pH"]),
            "ideal_radar_json": json.dumps([0, 0, 0, 0]),
            "actual_radar_json": json.dumps([user_data.get("N", 0), user_data.get("P", 0), user_data.get("K", 0), user_data.get("ph", 0)])
        }

    nutrient_metrics = [
        ("N", "Nito", 2),
        ("P", "Phốt pho", 2),
        ("K", "Kali", 2),
        ("ph", "Độ pH", 1)
    ]
    metric_ranges = {
        "N": ("N_min", "N_max"),
        "P": ("P_min", "P_max"),
        "K": ("K_min", "K_max"),
        "ph": ("ph_min", "ph_max")
    }

    nutrient_review = []
    for key, label, importance in nutrient_metrics:
        min_col, max_col = metric_ranges[key]
        min_val = float(row[min_col])
        max_val = float(row[max_col])
        status = get_status_for_metric(user_data[key], min_val, max_val)
        nutrient_review.append({
            "key": key,
            "label": label,
            "value": round(user_data[key], 1),
            "range_text": f"{round(min_val, 1)}-{round(max_val, 1)}",
            "status": status,
            "importance": "Cao" if importance == 2 else "Trung bình"
        })

    ideal = get_ideal_profile(crop_name)
    radar_labels = ["Nito", "Phốt pho", "Kali", "Độ pH"]
    
    # Đảm bảo tất cả giá trị là số hợp lệ, không NaN
    def safe_float(value, default=0):
        try:
            val = float(value)
            return val if not np.isnan(val) else default
        except (ValueError, TypeError):
            return default
    
    ideal_radar = [
        safe_float(ideal.get("N", 0)),
        safe_float(ideal.get("P", 0)),
        safe_float(ideal.get("K", 0)),
        safe_float(ideal.get("ph", 0))
    ]
    actual_radar = [
        safe_float(user_data.get("N", 0)),
        safe_float(user_data.get("P", 0)),
        safe_float(user_data.get("K", 0)),
        safe_float(user_data.get("ph", 0))
    ]

    return {
        "ideal": ideal,
        "nutrient_review": nutrient_review,
        "radar_labels": radar_labels,
        "ideal_radar": ideal_radar,
        "actual_radar": actual_radar,
        "radar_labels_json": json.dumps(radar_labels),
        "ideal_radar_json": json.dumps(ideal_radar),
        "actual_radar_json": json.dumps(actual_radar)
    }

def update_history(result_data, user_data):
    history = session.get("prediction_history", [])
    history_entry = {
        "crop": result_data["final"]["crop"],
        "accuracy": result_data["final"]["accuracy"],
        "time": datetime.now().strftime("%H:%M"),
        "snapshot": f"N:{int(user_data['N'])} P:{int(user_data['P'])} K:{int(user_data['K'])} pH:{round(user_data['ph'], 1)}"
    }
    history.insert(0, history_entry)
    session["prediction_history"] = history[:6]

def get_dataset_limits():
    if df_scoring.empty:
        return {}

    limits = {}
    for field, config in SCORING_CONFIG.items():
        min_col = config["min_col"]
        max_col = config["max_col"]
        if min_col not in df_scoring.columns or max_col not in df_scoring.columns:
            continue
        limits[field] = (
            float(df_scoring[min_col].min()),
            float(df_scoring[max_col].max())
        )
    return limits

def is_harsh_environment(user_data):
    dataset_limits = get_dataset_limits()
    if not dataset_limits:
        return False

    outside_count = 0
    for field, (global_min, global_max) in dataset_limits.items():
        value = user_data.get(field)
        if value is None:
            continue

        span = max(global_max - global_min, 1.0)
        tolerance = span * 0.15
        if value < (global_min - tolerance) or value > (global_max + tolerance):
            outside_count += 1

    return outside_count >= 3

def validate_form_data(form):
    user_data = {}
    errors = {}

    for field_name, label in FIELD_LABELS.items():
        raw_value = form.get(field_name, '').strip()

        if not raw_value:
            errors[field_name] = f"Vui lòng nhập {label.lower()}."
            continue

        try:
            value = float(raw_value)
        except ValueError:
            errors[field_name] = f"{label} phải là số hợp lệ."
            continue

        if not np.isfinite(value):
            errors[field_name] = f"{label} không hợp lệ."
            continue

        hard_min, hard_max = HARD_INPUT_LIMITS[field_name]
        if value < hard_min or value > hard_max:
            if field_name == "ph":
                errors[field_name] = "Độ pH cần nằm trong khoảng 0 đến 14."
            elif field_name == "humidity":
                errors[field_name] = "Độ ẩm cần nằm trong khoảng 0% đến 100%."
            else:
                errors[field_name] = f"{label} nên nằm trong khoảng {hard_min} đến {hard_max}."
            continue

        user_data[field_name] = value

    return user_data, errors

def check_soft_limits_warnings(user_data):
    """Kiểm tra xem dữ liệu có nằm ngoài khoảng tối ưu của cây trồng không"""
    warnings = []
    
    if df_scoring.empty:
        return warnings
    
    # Lấy khoảng tối ưu từ tất cả cây trồng
    soft_limits = {}
    for field_key, config in SCORING_CONFIG.items():
        if field_key not in user_data:
            continue
        
        min_col = config["min_col"]
        max_col = config["max_col"]
        
        if min_col in df_scoring.columns and max_col in df_scoring.columns:
            overall_min = df_scoring[min_col].min()
            overall_max = df_scoring[max_col].max()
            soft_limits[field_key] = (overall_min, overall_max)
    
    # Kiểm tra từng thông số
    field_name_map = {
        "N": "Nito (N)",
        "P": "Phốt pho (P)",
        "K": "Kali (K)",
        "temperature": "Nhiệt độ",
        "humidity": "Độ ẩm",
        "ph": "Độ pH",
        "rainfall": "Lượng mưa"
    }
    
    for field_key, (soft_min, soft_max) in soft_limits.items():
        if field_key not in user_data:
            continue
        
        value = user_data[field_key]
        field_label = field_name_map.get(field_key, field_key)
        
        if value < soft_min or value > soft_max:
            warning_msg = f"⚠️ {field_label} có giá trị {value} nằm ngoài khoảng tối ưu ({soft_min:.1f}-{soft_max:.1f}). Điều này có thể ảnh hưởng đến sự phát triển của cây."
            warnings.append(warning_msg)
    
    return warnings

def check_soft_limits_warnings(user_data):
    """Kiểm tra xem dữ liệu có nằm ngoài khoảng tối ưu của cây trồng không"""
    warnings = []
    
    if df_scoring.empty:
        return warnings
    
    # Lấy khoảng tối ưu từ tất cả cây trồng
    soft_limits = {}
    for field_key, config in SCORING_CONFIG.items():
        if field_key not in user_data:
            continue
        
        min_col = config["min_col"]
        max_col = config["max_col"]
        
        if min_col in df_scoring.columns and max_col in df_scoring.columns:
            overall_min = df_scoring[min_col].min()
            overall_max = df_scoring[max_col].max()
            soft_limits[field_key] = (overall_min, overall_max)
    
    # Kiểm tra từng thông số
    field_name_map = {
        "N": "Nito (N)",
        "P": "Phốt pho (P)",
        "K": "Kali (K)",
        "temperature": "Nhiệt độ",
        "humidity": "Độ ẩm",
        "ph": "Độ pH",
        "rainfall": "Lượng mưa"
    }
    
    for field_key, (soft_min, soft_max) in soft_limits.items():
        if field_key not in user_data:
            continue
        
        value = user_data[field_key]
        field_label = field_name_map.get(field_key, field_key)
        
        if value < soft_min or value > soft_max:
            warning_msg = f"⚠️ {field_label} có giá trị {value} nằm ngoài khoảng tối ưu ({soft_min:.1f}-{soft_max:.1f}). Điều này có thể ảnh hưởng đến sự phát triển của cây."
            warnings.append(warning_msg)
    
    return warnings

# --- 3. RULE-BASED LOGIC ---
def get_metric_fit_score(value, min_val, max_val):
    span = max(max_val - min_val, 1e-6)
    center = (min_val + max_val) / 2

    if min_val <= value <= max_val:
        # Inside ideal range: reward closer to center.
        center_distance = abs(value - center) / (span / 2 + 1e-6)
        fit_score = max(0.6, 1 - 0.4 * center_distance)
        return fit_score, center_distance

    overflow = min(abs(value - min_val), abs(value - max_val)) / span
    fit_score = max(0.0, 1 - overflow)
    return fit_score, 1 + overflow


def rule_based_filter(input_data):
    results = []
    total_weight = sum(config["weight"] for config in SCORING_CONFIG.values())

    for _, row in df_scoring.iterrows():
        score = 0.0
        hard_match_count = 0
        center_distance_sum = 0.0

        for field, config in SCORING_CONFIG.items():
            min_val = float(row[config["min_col"]])
            max_val = float(row[config["max_col"]])
            weight = config["weight"]

            fit_score, center_distance = get_metric_fit_score(input_data[field], min_val, max_val)
            score += fit_score * weight
            center_distance_sum += center_distance
            if min_val <= input_data[field] <= max_val:
                hard_match_count += 1

        raw_accuracy = (score / total_weight) * 100
        accuracy = round(raw_accuracy, 1)
        results.append({
            'crop': row['crop'],
            'score': score,
            'accuracy': accuracy,
            'raw_accuracy': raw_accuracy,
            'hard_match_count': hard_match_count,
            'center_distance_sum': center_distance_sum
        })

    top_3 = sorted(
        results,
        key=lambda x: (
            -x['raw_accuracy'],
            -x['hard_match_count'],
            x['center_distance_sum'],
            x['crop'].lower()
        )
    )[:3]

    for item in top_3:
        crop_name = item['crop']
        item['score'] = round(item['score'], 2)
        item['image'] = get_crop_image(crop_name)
        item['details'] = get_crop_details(crop_name)
        item['ideal_profile'] = get_ideal_profile(crop_name)
        item['detail_ranges'] = get_detail_ranges(crop_name)

    return top_3

# --- 4. ROUTES ---
@app.route('/', methods=['GET', 'POST'])
def index():
    result = None
    form_data = {}
    form_errors = {}
    soft_warnings = []
    input_hints = build_input_hints()

    if request.method == 'POST':
        form_data = {field: request.form.get(field, '').strip() for field in FIELD_LABELS}
        try:
            user_data, form_errors = validate_form_data(request.form)

            if form_errors:
                return render_template(
                    'index.html',
                    result=result,
                    form_data=form_data,
                    form_errors=form_errors,
                    soft_warnings=soft_warnings,
                    input_hints=input_hints,
                    history=session.get("prediction_history", [])
                )

            # Kiểm tra soft limits (khoảng tối ưu)
            soft_warnings = check_soft_limits_warnings(user_data)

            top_3 = rule_based_filter(user_data)
            if not top_3:
                result = {"error": "Không có dữ liệu cây trồng hợp lệ để phân tích."}
                return render_template(
                    'index.html',
                    result=result,
                    form_data=form_data,
                    form_errors=form_errors,
                    soft_warnings=soft_warnings,
                    input_hints=input_hints,
                    history=session.get("prediction_history", [])
                )
            
            # Predict by ML
            feat = [[user_data['N'], user_data['P'], user_data['K'], user_data['temperature'], 
                     user_data['humidity'], user_data['ph'], user_data['rainfall']]]
            ml_crop = model.predict(feat)[0]
            
            # Hybrid Logic
            top_item = top_3[0]
            ml_item = next((item for item in top_3 if item['crop'] == ml_crop), None)
            if ml_item and ml_item['raw_accuracy'] + 5 >= top_item['raw_accuracy']:
                final_item = ml_item
            else:
                final_item = top_item
            
            result = {
                'final': final_item,
                'top_3': top_3,
                'is_low_conf': final_item['raw_accuracy'] < 20 or is_harsh_environment(user_data),
                'analysis': build_analysis(user_data, final_item['crop'])
            }
            if not result['is_low_conf']:
                update_history(result, user_data)
        except Exception as e:
            result = {
                'error': str(e),
                'analysis': {
                    'radar_labels': ['Nito', 'Phốt pho', 'Kali', 'Độ pH'],
                    'ideal_radar': [0, 0, 0, 0],
                    'actual_radar': [user_data.get('N', 0), user_data.get('P', 0), user_data.get('K', 0), user_data.get('ph', 0)],
                    'radar_labels_json': json.dumps(['Nito', 'Phốt pho', 'Kali', 'Độ pH']),
                    'ideal_radar_json': json.dumps([0, 0, 0, 0]),
                    'actual_radar_json': json.dumps([user_data.get('N', 0), user_data.get('P', 0), user_data.get('K', 0), user_data.get('ph', 0)])
                }
            }

    return render_template(
        'index.html',
        result=result,
        form_data=form_data,
        form_errors=form_errors,
        soft_warnings=soft_warnings,
        input_hints=input_hints,
        history=session.get("prediction_history", [])
    )

@app.route('/clear-history', methods=['POST'])
def clear_history():
    session["prediction_history"] = []
    return redirect(url_for("index"))

if __name__ == '__main__':
    app.run(debug=True)
from flask import Flask, render_template, request
import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from urllib.parse import quote
import os

app = Flask(__name__)

# --- 1. TRAIN ML MODEL ---
def train_model():
    if not os.path.exists('crop_data.csv'):
        # Nếu chưa có data, gọi script tạo data (đã có ở bước trước)
        from data_setup import generate_data
        generate_data()
    
    df = pd.read_csv('crop_data.csv')
    X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
    y = df['crop']
    model = DecisionTreeClassifier(random_state=42)
    model.fit(X, y)
    return model

model = train_model()
df_range = pd.read_csv('crop_range.csv')

# --- 2. IMAGE HELPER ---
def get_crop_image(crop_name):
    # Mã hóa tên cây để tránh lỗi URL khi có dấu cách
    query = quote(f"{crop_name} plant agriculture")
    # Sử dụng nguồn ảnh ổn định hơn
    return f"https://loremflickr.com/400/300/{query}"

# --- 3. RULE-BASED LOGIC ---
def rule_based_filter(input_data):
    results = []
    for _, row in df_range.iterrows():
        score = 0
        if row['N_min'] <= input_data['N'] <= row['N_max']: score += 2
        if row['P_min'] <= input_data['P'] <= row['P_max']: score += 2
        if row['K_min'] <= input_data['K'] <= row['K_max']: score += 2
        if row['rain_min'] <= input_data['rainfall'] <= row['rain_max']: score += 2
        if row['temp_min'] <= input_data['temperature'] <= row['temp_max']: score += 1
        if row['humidity_min'] <= input_data['humidity'] <= row['humidity_max']: score += 1
        if row['ph_min'] <= input_data['ph'] <= row['ph_max']: score += 1
        
        accuracy = round((score / 11) * 100, 1)
        results.append({
            'crop': row['crop'], 
            'score': score, 
            'accuracy': accuracy,
            'image': get_crop_image(row['crop'])
        })
    return sorted(results, key=lambda x: x['score'], reverse=True)[:3]

# --- 4. ROUTES ---
@app.route('/', methods=['GET', 'POST'])
def index():
    result = None
    if request.method == 'POST':
        try:
            user_data = {
                'N': float(request.form['N']), 'P': float(request.form['P']),
                'K': float(request.form['K']), 'temperature': float(request.form['temperature']),
                'humidity': float(request.form['humidity']), 'ph': float(request.form['ph']),
                'rainfall': float(request.form['rainfall'])
            }
            top_3 = rule_based_filter(user_data)
            
            # Predict by ML
            feat = [[user_data['N'], user_data['P'], user_data['K'], user_data['temperature'], 
                     user_data['humidity'], user_data['ph'], user_data['rainfall']]]
            ml_crop = model.predict(feat)[0]
            
            # Hybrid Logic
            final_item = next((item for item in top_3 if item['crop'] == ml_crop), top_3[0])
            
            result = {
                'final': final_item,
                'top_3': top_3,
                'is_low_conf': final_item['accuracy'] < 20
            }
        except Exception as e:
            result = {'error': str(e)}

    return render_template('index.html', result=result)

if __name__ == '__main__':
    app.run(debug=True)
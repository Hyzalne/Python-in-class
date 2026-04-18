# Crop Recommendation System

## Giới thiệu dự án

Đây là một hệ thống gợi ý cây trồng thông minh được xây dựng bằng Python, sử dụng Flask framework cho web application và Machine Learning (RandomForest Classifier) để dự đoán loại cây trồng phù hợp dựa trên các yếu tố môi trường.

### Tính năng chính:
- **Gợi ý cây trồng**: Nhập các thông số như N, P, K, nhiệt độ, độ ẩm, pH, lượng mưa để nhận gợi ý cây trồng phù hợp.
- **Tính điểm phù hợp**: Hệ thống tính điểm cho từng loại cây dựa trên khoảng giá trị tối ưu từ dữ liệu.
- **Hiển thị thông tin chi tiết**: Hiển thị hình ảnh, mô tả, và thông tin chăm sóc cho cây trồng được gợi ý.
- **Biểu đồ radar**: So sánh trực quan giữa đất thực tế và ngưỡng lý tưởng cho cây trồng được gợi ý.
- **Hệ thống kiểm tra xác thực 2 cấp độ**:
  - **Hard Limits (Giới hạn cứng)**: Kiểm tra các điều kiện vật lý không thể vượt qua (ví dụ: pH 0-14, nhiệt độ >= -273.15°C). Nếu vi phạm, dự đoán sẽ bị chặn.
  - **Soft Limits (Giới hạn mềm)**: Cảnh báo khi các thông số nằm ngoài khoảng tối ưu của cây trồng. Hiển thị cảnh báo màu đỏ nhưng vẫn cho phép dự đoán tiếp tục.
- **Giao diện web**: Giao diện đơn giản, dễ sử dụng với Bootstrap CSS.

### Công nghệ sử dụng:
- **Backend**: Python Flask
- **Machine Learning**: Scikit-learn (RandomForest)
- **Data Processing**: Pandas, NumPy
- **Visualization**: Chart.js (biểu đồ radar)
- **Frontend**: HTML, CSS (Bootstrap)
- **Data Sources**: CSV files (crop_data.csv, crop_range.csv, export_crops.csv)

## Hướng dẫn cài đặt

### Yêu cầu hệ thống:
- Python 3.7+
- Pip (package manager)

### Các bước cài đặt:

1. **Clone hoặc tải dự án**:
   ```bash
   git clone <repository-url>
   cd crop-recommendation-project
   ```

2. **Cài đặt dependencies**:
   ```bash
   pip install flask pandas numpy scikit-learn
   ```

3. **Chuẩn bị dữ liệu**:
   - Đảm bảo các file CSV sau tồn tại trong thư mục dự án:
     - `crop_data.csv`: Dữ liệu huấn luyện cho mô hình ML
     - `crop_range.csv`: Khoảng giá trị tối ưu cho cây trồng
     - `export_crops.csv`: Dữ liệu cây trồng xuất khẩu (ưu tiên)
     - `crop_details.json`: Thông tin chi tiết về cây trồng

   Nếu thiếu `crop_data.csv` hoặc `crop_range.csv`, chạy script tạo dữ liệu:
   ```bash
   python data_setup.py
   ```

4. **Chạy ứng dụng**:
   ```bash
   python app.py
   ```

5. **Truy cập ứng dụng**:
   Mở trình duyệt và truy cập: `http://localhost:5000`

## Hướng dẫn thực hành

### Sử dụng web application:

1. **Trang chủ**: Nhập các thông số môi trường:
   - N (Nito): 0-400
   - P (Phốt pho): 0-400
   - K (Kali): 0-400
   - Nhiệt độ: -20°C đến 70°C
   - Độ ẩm: 0-100%
   - Độ pH: 0-14
   - Lượng mưa: 0-500 mm

2. **Kiểm tra xác thực dữ liệu**:
   - **Hard Limits (Lỗi)**: Nếu bất kỳ giá trị nào vi phạm giới hạn vật lý (ví dụ pH < 0 hoặc pH > 14), thông báo lỗi sẽ xuất hiện và dự đoán sẽ bị chặn. Bạn phải sửa giá trị trước khi tiếp tục.
   - **Soft Limits (Cảnh báo)**: Nếu các giá trị nằm ngoài khoảng tối ưu của cây trồng, một cảnh báo màu đỏ sẽ hiển thị phía trên kết quả. Cảnh báo này giúp bạn biết điều kiện không tối ưu, nhưng vẫn cho phép dự đoán tiếp tục.

3. **Nhận gợi ý**:
   - Nhấn nút "KHỞI TẠO DỰ ĐOÁN"
   - Hệ thống sẽ hiển thị:
     - Loại cây trồng được gợi ý bởi ML
     - Điểm phù hợp (tính từ dữ liệu range)
     - Thông tin chi tiết về cây trồng (nếu có)

4. **Xem biểu đồ radar**:
   - Sau khi có kết quả, nhấn nút "Xem biểu đồ radar so sánh đất"
   - Biểu đồ sẽ hiển thị so sánh giữa đất thực tế (xanh) và ngưỡng lý tưởng (đen) cho cây trồng được gợi ý

5. **Xem kết quả**:
   - Danh sách các cây trồng với điểm số
   - Hình ảnh từ Wikipedia
   - Mô tả, yêu cầu ánh sáng, đất, sâu bệnh, cách chăm sóc

### Ví dụ thực hành:

**Đầu vào mẫu**:
- N: 90
- P: 42
- K: 43
- Nhiệt độ: 20.8797
- Độ ẩm: 82.0027
- pH: 6.5029
- Lượng mưa: 202.9355

**Kết quả mong đợi**: Hệ thống có thể gợi ý "rice" hoặc các loại cây khác phù hợp với điều kiện nhiệt đới ẩm.

## Hệ thống Kiểm tra Xác thực (Validation System)

Ứng dụng sử dụng hệ thống kiểm tra xác thực 2 cấp độ để đảm bảo chất lượng dữ liệu và cung cấp hỗ trợ cho người dùng:

### Hard Limits (Giới hạn cứng)
Những giới hạn này là các ràng buộc vật lý không thể vượt qua:

| Thông số | Giới hạn |
|----------|---------|
| Nito (N) | 0 - 400 |
| Phốt pho (P) | 0 - 400 |
| Kali (K) | 0 - 400 |
| Nhiệt độ | -20°C đến 70°C |
| Độ ẩm | 0% - 100% |
| Độ pH | 0 - 14 |
| Lượng mưa | 0 - 500 mm |

**Nếu vi phạm**: Thông báo lỗi màu đỏ sẽ xuất hiện dưới trường nhập liệu, và dự đoán sẽ bị chặn cho đến khi bạn sửa lại giá trị.

### Soft Limits (Giới hạn mềm - Cảnh báo)
Những giới hạn này dựa trên khoảng tối ưu của cây trồng từ dữ liệu:

- Nếu giá trị nhập vào nằm ngoài khoảng tối ưu của cây trồng, một **cảnh báo (warning)** sẽ hiển thị
- Cảnh báo có hình thức là một hộp màu đỏ phía trên kết quả dự đoán
- **Cảnh báo không chặn dự đoán**, bạn vẫn nhận được gợi ý cây trồng, nhưng cần lưu ý rằng điều kiện không tối ưu

**Ví dụ cảnh báo**:
```
⚠️ CẢNH BÁO ĐIỀU KIỆN CỰC ĐOẠN
Cảnh báo: Nhiệt độ có giá trị 45 nằm ngoài khoảng tối ưu (27.1-30.6). 
Điều này có thể ảnh hưởng đến sự phát triển của cây.
```

### Lưu ý:
- Ứng dụng sử dụng dữ liệu từ `export_crops.csv` nếu có, nếu không thì dùng `crop_range.csv`
- Mô hình ML được train với 300 cây quyết định (RandomForest)
- Hình ảnh cây trồng được fetch từ Wikipedia API

## Cấu trúc dự án

```
crop_recommendation_project/
├── app.py                 # File chính của ứng dụng Flask
├── data_setup.py          # Script tạo dữ liệu mẫu
├── crop_data.csv          # Dữ liệu huấn luyện ML
├── crop_range.csv         # Khoảng giá trị tối ưu
├── export_crops.csv       # Dữ liệu cây trồng xuất khẩu
├── crop_details.json      # Thông tin chi tiết cây trồng
├── static/
│   └── style.css          # CSS styling
└── templates/
    └── index.html         # Template HTML chính
```

## Đóng góp

Nếu bạn muốn đóng góp cho dự án:
1. Fork repository
2. Tạo branch mới cho feature
3. Commit changes
4. Push và tạo Pull Request

## Giấy phép

Dự án này sử dụng giấy phép MIT. Xem file LICENSE để biết thêm chi tiết.
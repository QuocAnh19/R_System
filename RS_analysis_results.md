# Phân tích chi tiết RS Project

Dự án triển khai một hệ thống gợi ý khóa học theo lộ trình nghề nghiệp (**Career-Based Course Recommendation System**), bao gồm hai phần chính: **Backend** (Node.js + Express) và **Frontend** (React + Vite). Hệ thống sử dụng dữ liệu tĩnh từ nhiều file JS để tính toán mức độ phù hợp kỹ năng, đề xuất khóa học và hiển thị lộ trình học tập.

---

## 1. Tổng quan Kiến trúc Hệ thống

```
RS_Project/
├── backend/
│   └── src/
│       ├── app.js                     # Entry point, khởi động Express server cổng 5000
│       ├── routes/
│       │   └── recommendationRoutes.js   # Định nghĩa các API endpoint
│       ├── controllers/
│       │   └── recommendationController.js  # Xử lý request/response
│       ├── services/
│       │   └── recommendationService.js     # Logic nghiệp vụ cốt lõi
│       └── data/
│           ├── careers.js       # Danh sách ~60 nghề nghiệp IT
│           ├── skills.js        # Danh sách toàn bộ kỹ năng
│           ├── careerSkills.js  # Mapping nghề → danh sách kỹ năng yêu cầu
│           ├── courses.js       # ~650 dòng khóa học từ Coursera
│           └── roadmaps.js      # ~1000 dòng lộ trình học tập theo nghề
└── frontend/
    └── src/
        └── services/
            └── recommendationApi.js   # Gọi API từ React qua Axios
```

Khi khởi động, server lắng nghe tại `http://localhost:5000`. Frontend giao tiếp với backend qua biến môi trường `VITE_API_URL` (mặc định `http://127.0.0.1:5000/api`).

---

## 2. Chi tiết Các File và Chức năng

### 2.1 `app.js` — Entry Point

**Chức năng**: Khởi tạo ứng dụng Express, cấu hình middleware và đăng ký router.

- Bật CORS cho phép frontend truy cập cross-origin.
- Parse body JSON cho các request POST.
- Mount tất cả API routes vào prefix `/api`.
- Cung cấp hai endpoint kiểm tra nhanh: `GET /` và `GET /test`.
- Lắng nghe kết nối tại cổng `5000`.

### 2.2 `recommendationRoutes.js` — Định tuyến API

**Chức năng**: Khai báo bốn endpoint và gắn với handler tương ứng trong controller.

| Method | Endpoint | Handler |
| :--- | :--- | :--- |
| `POST` | `/api/recommend` | `recommend` |
| `GET` | `/api/careers` | `getCareers` |
| `GET` | `/api/skills` | `getSkills` |
| `GET` | `/api/skills/:careerName` | `getSkillsByCareer` |

### 2.3 `recommendationController.js` — Tầng Controller

**Chức năng**: Nhận request, gọi service, trả response. Mỗi hàm export tương ứng một endpoint:

- **`recommend`**: Đọc `career` và `skills` từ `req.body`, gọi `generateRecommendation()`. Nếu service trả về `error`, phản hồi `HTTP 400`; ngược lại trả `HTTP 200` với kết quả gợi ý.
- **`getCareers`**: Trả toàn bộ mảng từ `careers.js` (danh sách ~60 nghề).
- **`getSkills`**: Trả toàn bộ mảng từ `skills.js`.
- **`getSkillsByCareer`**: Nhận `careerName` từ URL param, tra cứu trong `careerSkills`. Nếu không tìm thấy, trả `HTTP 404`; ngược lại trả danh sách kỹ năng yêu cầu của nghề đó.

### 2.4 `recommendationService.js` — Logic Nghiệp vụ Cốt lõi

Đây là trung tâm xử lý của toàn bộ hệ thống. Hàm `generateRecommendation(careerName, userSkills)` thực hiện tuần tự các bước sau:

**Bước 1 — Kiểm tra đầu vào**:
- Trả về `{ error: "Career not found" }` nếu `careerName` không tồn tại trong `careerSkills`.
- Trả về `{ error: "Invalid skills format..." }` nếu `userSkills` không phải mảng.

**Bước 2 — Tính toán kỹ năng**:
- Lấy `requiredSkills` = danh sách kỹ năng yêu cầu của nghề từ `careerSkills.js`.
- Tính `matchedSkills` = giao giữa `requiredSkills` và `userSkills` (kỹ năng đã có).
- Tính `missingSkills` = phần còn lại của `requiredSkills` (kỹ năng còn thiếu).

**Bước 3 — Tính điểm phù hợp**:

$$\text{score} = \text{round}\left(\frac{|\text{matchedSkills}|}{|\text{requiredSkills}|} \times 100\right)$$

**Bước 4 — Gợi ý khóa học**:
- Lọc từ `courses.js` những khóa học có trường `skill` nằm trong `missingSkills`, trả về danh sách `recommendedCourses`.

**Bước 5 — Xây dựng lộ trình học tập**:
- Lấy `careerRoadmap` từ `roadmaps.js` (mảng rỗng nếu chưa có roadmap cho nghề này, tránh crash).
- Map từng bước trong roadmap, gắn thêm trường `completed: true/false` dựa trên việc kỹ năng đó có trong `userSkills` hay không.

**Bước 6 — Tạo phân tích ngôn ngữ tự nhiên**:
- Tự động sinh chuỗi `analysis` mô tả tiến độ kỹ năng, ví dụ: *"Bạn hiện đã có 5/12 kỹ năng cần thiết cho vị trí Backend Developer. Bạn nên học thêm: Docker, Redis, GraphQL..."*

**Kết quả trả về** là một object JSON đầy đủ:

```json
{
  "career": "Backend Developer",
  "score": 42,
  "matchedSkills": ["Node.js", "Git", "Python"],
  "missingSkills": ["Docker", "Redis", "GraphQL", "..."],
  "recommendedCourses": [{ "title": "...", "skill": "...", "url": "..." }],
  "roadmap": [{ "step": 1, "skill": "Express.js", "completed": false }],
  "analysis": "Bạn hiện đã có 5/12 kỹ năng..."
}
```

### 2.5 `recommendationApi.js` — Frontend Service

**Chức năng**: Đóng gói toàn bộ logic gọi API backend trong một module duy nhất, sử dụng thư viện Axios.

- **`getRecommendation(data)`**: Gửi `POST /api/recommend` với `{ career, skills }`, trả về kết quả gợi ý.
- **`getCareers()`**: Gửi `GET /api/careers`, trả về danh sách nghề để hiển thị dropdown.
- **`getSkillsByCareer(careerName)`**: Gửi `GET /api/skills/:careerName` (có encode URL), trả về danh sách kỹ năng để render checkbox/danh sách chọn.

---

## 3. Chi tiết Dữ liệu Tĩnh

| File | Nội dung | Quy mô |
| :--- | :--- | :--- |
| `careers.js` | Mảng object `{ id, name }` — danh sách nghề IT | ~60 nghề |
| `skills.js` | Mảng chuỗi — tất cả kỹ năng trong hệ thống | Hàng trăm kỹ năng |
| `careerSkills.js` | Object mapping `careerName → string[]` | ~60 nghề, mỗi nghề 8–15 kỹ năng |
| `courses.js` | Mảng object `{ title, skill, organization, difficulty, rating, url }` | ~650 dòng, nguồn Coursera |
| `roadmaps.js` | Object mapping `careerName → step[]` mỗi step gồm `{ step, skill, title }` | ~1000 dòng |

---

## 4. Luồng Dữ liệu Hoàn chỉnh

```
[React Frontend]
    │  Người dùng chọn nghề + tích kỹ năng
    ▼
recommendationApi.js → POST /api/recommend  { career, skills[] }
    ▼
[Express Backend]
recommendationRoutes.js → recommendationController.js
    ▼
recommendationService.js::generateRecommendation()
    ├── careerSkills.js  →  requiredSkills
    ├── courses.js       →  recommendedCourses (lọc theo missingSkills)
    └── roadmaps.js      →  roadmap (gắn completed flag)
    ▼
Response JSON: { score, matchedSkills, missingSkills, recommendedCourses, roadmap, analysis }
    ▼
[React Frontend] → Render kết quả, lộ trình, khóa học gợi ý
```

---

## 5. Ảnh Hưởng của Các Thành Phần Đến Kết Quả Gợi ý

| Thành phần | Ảnh hưởng trực tiếp đến kết quả | Mức độ |
| :--- | :--- | :--- |
| **`careerSkills.js`** | Quyết định tập kỹ năng yêu cầu — ảnh hưởng toàn bộ kết quả tính toán | **Rất cao** |
| **`generateRecommendation()`** | Trung tâm logic: tính `score`, `matchedSkills`, `missingSkills`, gọi dữ liệu khóa học và roadmap | **Rất cao** |
| **`courses.js`** | Chất lượng và độ phủ của danh sách khóa học gợi ý phụ thuộc vào sự đầy đủ của file này | **Cao** |
| **`roadmaps.js`** | Xác định thứ tự học tập được hiển thị, kèm trạng thái `completed` | **Cao** |
| **`recommendationApi.js`** | Truyền đúng `career` và `skills[]` lên server; lỗi encode hoặc sai cấu trúc sẽ làm hỏng kết quả | **Trung bình** |
| **`recommendationController.js`** | Xử lý lỗi và chuyển đổi HTTP status code đúng để frontend phân biệt success/error | **Trung bình** |

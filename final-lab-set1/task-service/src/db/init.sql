CREATE TABLE IF NOT EXISTS tasks (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  status      VARCHAR(20) DEFAULT 'TODO'
              CHECK (status IN ('TODO','IN_PROGRESS','DONE')),
  priority    VARCHAR(10) DEFAULT 'medium'
              CHECK (priority IN ('low','medium','high')),
  user_id    VARCHAR(50) NOT NULL,     -- user_id จาก JWT
  assignee_id VARCHAR(50),
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- ข้อมูลทดสอบ
INSERT INTO tasks (title, description, status, priority, user_id) VALUES
  ('ออกแบบ Database Schema', 'วาด ERD สำหรับ Task Board', 'DONE', 'high', 1),
  ('สร้าง Auth Service', 'Implement JWT login/register', 'IN_PROGRESS', 'high', 1),
  ('เขียน Unit Tests', 'เพิ่ม test coverage ให้ถึง 80%', 'TODO', 'medium', 2),
  ('ทำ Docker Setup', 'สร้าง docker-compose.yml', 'DONE', 'high', 3)
ON CONFLICT DO NOTHING;
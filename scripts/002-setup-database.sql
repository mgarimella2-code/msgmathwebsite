-- Enable Row Level Security
ALTER TABLE IF EXISTS page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS important_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS class_content ENABLE ROW LEVEL SECURITY;

-- Create tables for the math teacher website
CREATE TABLE IF NOT EXISTS page_content (
  id SERIAL PRIMARY KEY,
  page_type VARCHAR(50) NOT NULL,
  page_identifier VARCHAR(100),
  section_type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  content TEXT,
  link_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS important_links (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS class_content (
  id SERIAL PRIMARY KEY,
  class_name VARCHAR(100) NOT NULL,
  section_type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  content TEXT,
  link_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create policies to allow public read access
CREATE POLICY "Allow public read access" ON page_content FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON important_links FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON class_content FOR SELECT USING (true);

-- Insert initial data
INSERT INTO important_links (title, url, display_order) VALUES
('Math 1 HW and Textbook', 'https://my.mheducation.com/login', 1),
('AP PreCalc Flipped Math', 'https://precalculus.flippedmath.com/ap-precalc.html', 2),
('AP Classroom', 'https://myap.collegeboard.org/login', 3),
('Graphing Calculator', 'https://desmos.com', 4),
('Powerschool', 'https://concept-il.powerschool.com/teachers/home.html', 5)
ON CONFLICT DO NOTHING;

-- Insert initial welcome content
INSERT INTO page_content (page_type, section_type, title, content) VALUES
('homepage', 'welcome', 'Welcome', 'Hi all! This is Ms. G''s website :) You can find all the information for class you need here and a weekly schedule! But if you have a question remember you can always find me in room 230!'),
('homepage', 'contact', 'Ms. G''s Contact Info :)', 'Feel free to email me at anytime at garimella@hsamckinley.org

I am free during the school day from 6th period to 8th period​

Tutoring: Tuesday''s and Thursday''s  

Make-up Quizzes and Tests: Monday''s afterschool OR schedule a time :)')
ON CONFLICT DO NOTHING;

-- Create the content table for permanent storage
CREATE TABLE IF NOT EXISTS website_content (
  id INTEGER PRIMARY KEY DEFAULT 1,
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default content if table is empty
INSERT INTO website_content (id, content, updated_at)
SELECT 1, '{
  "welcome": {
    "title": "Welcome",
    "content": "Hi all! This is Ms. G''s website :) You can find all the information for class you need here and a weekly schedule! But if you have a question remember you can always find me in room 230!"
  },
  "contact": {
    "title": "Ms. G''s Contact Info :)",
    "email": "garimella@hsamckinley.org",
    "officeHours": "I am free during the school day from 6th period to 8th period",
    "tutoring": "Tuesday''s and Thursday''s",
    "makeupTests": "Monday''s afterschool OR schedule a time :)"
  },
  "importantLinks": [
    {"id": 1, "title": "Math 1 HW and Textbook", "url": "https://my.mheducation.com/login"},
    {"id": 2, "title": "AP PreCalc Flipped Math", "url": "https://precalculus.flippedmath.com/ap-precalc.html"},
    {"id": 3, "title": "AP Classroom", "url": "https://myap.collegeboard.org/login"},
    {"id": 4, "title": "Graphing Calculator", "url": "https://desmos.com"},
    {"id": 5, "title": "Powerschool", "url": "https://concept-il.powerschool.com/teachers/home.html"}
  ],
  "classes": {
    "ap-precalc": {"name": "AP PreCalc", "sections": {"info": [], "notes": [], "study_guides": [], "classwork": [], "misc": []}},
    "math-1-period-1": {"name": "Math 1: Period 1", "sections": {"info": [], "notes": [], "study_guides": [], "classwork": [], "misc": []}},
    "math-1-honors": {"name": "Math 1 Honors", "sections": {"info": [], "notes": [], "study_guides": [], "classwork": [], "misc": []}},
    "math-1-period-4": {"name": "Math 1: Period 4", "sections": {"info": [], "notes": [], "study_guides": [], "classwork": [], "misc": []}},
    "math-1-period-5": {"name": "Math 1: Period 5", "sections": {"info": [], "notes": [], "study_guides": [], "classwork": [], "misc": []}}
  },
  "announcements": [
    {"id": 1, "title": "Welcome to the New School Year!", "content": "Welcome back students! I''m excited for another great year of math.", "date": "2024-08-15"}
  ]
}', NOW()
WHERE NOT EXISTS (SELECT 1 FROM website_content WHERE id = 1);

import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const CONTENT_DIR = path.join(process.cwd(), 'data')
const CONTENT_FILE = path.join(CONTENT_DIR, 'content.json')

// Default content with sample data
const defaultContent = {
  welcome: {
    title: "Welcome",
    content: "Hi all! This is Ms. G's website :) You can find all the information for class you need here and a weekly schedule! But if you have a question remember you can always find me in room 230!",
  },
  contact: {
    title: "Ms. G's Contact Info :)",
    email: "garimella@hsamckinley.org",
    officeHours: "I am free during the school day from 6th period to 8th period",
    tutoring: "Tuesday's and Thursday's",
    makeupTests: "Monday's afterschool OR schedule a time :)",
  },
  importantLinks: [
    { id: 1, title: "Math 1 HW and Textbook", url: "https://my.mheducation.com/login" },
    { id: 2, title: "AP PreCalc Flipped Math", url: "https://precalculus.flippedmath.com/ap-precalc.html" },
    { id: 3, title: "AP Classroom", url: "https://myap.collegeboard.org/login" },
    { id: 4, title: "Graphing Calculator", url: "https://desmos.com" },
    { id: 5, title: "Powerschool", url: "https://concept-il.powerschool.com/teachers/home.html" },
  ],
  classes: {
    "ap-precalc": {
      name: "AP PreCalc",
      sections: {
        info: [
          {
            id: 1,
            title: "Welcome to AP PreCalc!",
            content: "This is an advanced course that will prepare you for AP Calculus. Please make sure you have your graphing calculator for every class.",
            linkUrl: "",
            dateAdded: "2024-01-15"
          }
        ],
        notes: [
          {
            id: 2,
            title: "Chapter 1: Functions and Graphs",
            content: "Complete notes covering function notation, domain/range, and graphing techniques.",
            linkUrl: "https://docs.google.com/document/d/example-chapter1-notes",
            dateAdded: "2024-01-16"
          }
        ],
        study_guides: [
          {
            id: 3,
            title: "Unit 1 Study Guide Answer Key",
            content: "Complete solutions for the Unit 1 study guide covering functions and transformations.",
            linkUrl: "https://docs.google.com/document/d/example-unit1-answers",
            dateAdded: "2024-01-20"
          }
        ],
        classwork: [
          {
            id: 4,
            title: "Daily Warm-ups Week 1",
            content: "Practice problems for function evaluation and graphing. Complete these before class starts.",
            linkUrl: "https://docs.google.com/document/d/example-warmups-week1",
            dateAdded: "2024-01-15"
          }
        ],
        misc: [
          {
            id: 5,
            title: "AP Exam Information",
            content: "Important dates and information about the AP PreCalc exam in May.",
            linkUrl: "https://apcentral.collegeboard.org/courses/ap-precalculus",
            dateAdded: "2024-01-10"
          }
        ],
      },
    },
    "math-1-period-1": {
      name: "Math 1: Period 1",
      sections: {
        info: [],
        notes: [],
        study_guides: [],
        classwork: [],
        misc: [],
      },
    },
    "math-1-honors": {
      name: "Math 1 Honors",
      sections: {
        info: [],
        notes: [],
        study_guides: [],
        classwork: [],
        misc: [],
      },
    },
    "math-1-period-4": {
      name: "Math 1: Period 4",
      sections: {
        info: [],
        notes: [],
        study_guides: [],
        classwork: [],
        misc: [],
      },
    },
    "math-1-period-5": {
      name: "Math 1: Period 5",
      sections: {
        info: [],
        notes: [],
        study_guides: [],
        classwork: [],
        misc: [],
      },
    },
  },
  announcements: [
    {
      id: 1,
      title: "Welcome to the New School Year!",
      content: "Welcome back students! I'm excited for another great year of math. Please check your class pages for specific information.",
      date: "2024-08-15",
    },
  ],
}

async function ensureContentFile() {
  try {
    // Create data directory if it doesn't exist
    if (!existsSync(CONTENT_DIR)) {
      await mkdir(CONTENT_DIR, { recursive: true })
      console.log('Created data directory')
    }

    // Create content file if it doesn't exist
    if (!existsSync(CONTENT_FILE)) {
      await writeFile(CONTENT_FILE, JSON.stringify(defaultContent, null, 2))
      console.log('Created content file with default data')
    }
  } catch (error) {
    console.error('Error ensuring content file:', error)
  }
}

export async function GET() {
  try {
    await ensureContentFile()
    const content = await readFile(CONTENT_FILE, 'utf-8')
    const parsedContent = JSON.parse(content)
    console.log('Successfully loaded content from file')
    return NextResponse.json(parsedContent)
  } catch (error) {
    console.error('Error reading content:', error)
    console.log('Returning default content due to error')
    return NextResponse.json(defaultContent)
  }
}

export async function POST(request: NextRequest) {
  try {
    const newContent = await request.json()
    console.log('Received content to save:', Object.keys(newContent))
    
    await ensureContentFile()
    await writeFile(CONTENT_FILE, JSON.stringify(newContent, null, 2))
    
    console.log('Successfully saved content to file')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving content:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save content',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

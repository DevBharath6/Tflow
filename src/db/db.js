import Dexie from 'dexie';
import { v4 as uuidv4 } from 'uuid';

export const db = new Dexie('talentflow');

db.version(1).stores({
  jobs: 'id, slug, status, order, createdAt',
  candidates: 'id, email, name, jobId, stage',
  assessments: 'jobId',
  timelines: '++id, candidateId, at',
});

// ------------------ DATA ARRAYS ------------------
const JOB_TITLES = [
  'Frontend Developer', 'Backend Developer', 'Fullstack Engineer', 'DevOps Engineer',
  'QA Engineer', 'Mobile Developer', 'Data Scientist', 'Product Manager', 'UX Designer',
  'Cloud Engineer', 'System Administrator', 'Network Engineer', 'Cybersecurity Analyst',
  'Database Administrator', 'AI/ML Engineer', 'Blockchain Developer', 'Game Developer',
  'Embedded Systems Engineer', 'Technical Writer', 'Solution Architect', 'IT Support Specialist',
  'Project Manager', 'Business Analyst', 'Scrum Master', 'UI/UX Designer'
];

const STAGES = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

const FIRST_NAMES = [
  'Bharath', 'Swetha', 'Ravi', 'Kushi', 'Mahesh', 'Shreya', 'Ananya', 'Arjun',
  'Divya', 'Kiran', 'Neha', 'Siddharth', 'Pooja', 'Aakash', 'Lakshmi',
  'Rahul', 'Sneha', 'Manoj', 'Varun', 'Meera', 'Aditi', 'Pranav', 'Nisha',
  'Rohit', 'Gauri', 'Ankit', 'Kavya', 'Ganesh'
];

const LAST_NAMES = [
  'Singh', 'Shetty', 'Varma', 'Iyer', 'Reddy', 'Sharma', 'Patel', 'Nair',
  'Menon', 'Das', 'Chowdhury', 'Banerjee', 'Kulkarni', 'Mishra', 'Jha',
  'Pandey', 'Ghosh', 'Rao', 'Naidu', 'Sahu', 'Yadav', 'Kumar', 'Shah', 'Joshi'
];

const TECHS = [
  'React', 'Node.js', 'Angular', 'Vue.js', 'Next.js',
  'Express.js', 'Django', 'Flask', 'Spring Boot',
  'SQL', 'MySQL', 'PostgreSQL', 'MongoDB',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
  'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
  'HTML', 'CSS', 'JavaScript', 'TypeScript',
  'TailwindCSS', 'Bootstrap', 'Redux', 'TensorFlow', 'PyTorch',
  'Pandas', 'NumPy', 'GraphQL', 'REST API', 'Figma', 'Sketch'
];

const LOCATIONS = [
  'Mumbai', 'Hyderabad', 'Delhi', 'Bengaluru', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Silchar', 'Lucknow',
  'Jaipur', 'Chandigarh', 'Indore', 'Bhubaneswar', 'Cochin'
];

// ------------------ UTILITIES ------------------
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeSlug(title) {
  return (
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-') +
    '-' +
    Math.random().toString(36).slice(2, 7)
  );
}

function randomName() {
  return `${randomChoice(FIRST_NAMES)} ${randomChoice(LAST_NAMES)}`;
}

function randomEmail(name) {
  return `${name.toLowerCase().replace(/\s+/g, '.')}${Math.floor(Math.random() * 100)}@gmail.com`;
}

function randomSkills() {
  const shuffled = [...TECHS].sort(() => 0.5 - Math.random());
  const count = Math.floor(Math.random() * 5) + 1;
  return shuffled.slice(0, count);
}

function randomLocation() {
  return randomChoice(LOCATIONS);
}

function randomLatency() {
  return Math.random() * (1200 - 200) + 200;
}

function maybeError() {
  return Math.random() < 0.1; // 10% error rate
}

// ------------------ SEEDING FUNCTIONS ------------------
async function ensureJobsSeeded() {
  if (!(await db.jobs.count())) {
    const jobs = JOB_TITLES.map((title, i) => ({
      id: uuidv4(),
      title,
      slug: makeSlug(title),
      status: i % 4 === 0 ? 'archived' : 'active', // 25% archived
      tags: [],
      order: i,
      createdAt: new Date().toISOString()
    }));
    await db.jobs.bulkAdd(jobs);
    console.log('Seeded 25 jobs.');
  }
}

async function ensureCandidatesSeeded() {
  if (!(await db.candidates.count())) {
    const jobs = await db.jobs.toArray();

    const candidates = Array.from({ length: 1000 }).map(() => {
      const name = randomName();
      const job = randomChoice(jobs);
      const stage = randomChoice(STAGES);
      const id = uuidv4();

      return {
        id,
        name,
        email: randomEmail(name),
        jobId: job.id,
        job: job.title,
        stage,
        experience: Math.floor(Math.random() * 10) + 1,
        skills: randomSkills(),
        location: randomLocation(),
        notes: [],
        timeline: []
      };
    });
    await db.candidates.bulkAdd(candidates);
    console.log('Seeded 1,000 candidates.');
  }
}

async function ensureAssessmentsSeeded() {
  if (!(await db.assessments.count())) {
    const jobs = await db.jobs.toArray();
    const assessments = [];

    // Create 3 example assessments
    for (let i = 0; i < 3; i++) {
      const jobId = jobs[i].id;
      const sections = [{
        id: 's1',
        title: `Section 1 for ${jobs[i].title}`,
        questions: Array.from({ length: 10 + i }).map((_, qIdx) => {
          const type = randomChoice(['single', 'multi', 'short', 'long', 'number', 'file']);
          const base = {
            id: `q${qIdx + 1}`,
            type,
            label: `Sample Question ${qIdx + 1} (${type})`,
            required: Math.random() > 0.5,
          };
          if (type === 'single' || type === 'multi') {
            base.choices = ['Option A', 'Option B', 'Option C'];
          }
          if (type === 'number') {
            base.min = 0;
            base.max = 100;
          }
          if (type === 'short') {
            base.maxLength = 120;
          }
          if (type === 'long') {
            base.maxLength = 500;
          }
          return base;
        }),
      }];
      assessments.push({ jobId, sections, updatedAt: new Date().toISOString() });
    }
    await db.assessments.bulkAdd(assessments);
    console.log('Seeded 3 assessments with 10+ questions each.');
  }
}

export async function ensureSeeded() {
  await ensureJobsSeeded();
  await ensureCandidatesSeeded();
  await ensureAssessmentsSeeded();
}

// ------------------ API HANDLERS ------------------
import { http, HttpResponse } from 'msw';
const BASE = '/api';

export const handlers = [
  // ---------------- JOBS & CANDIDATES ----------------
  http.get(`${BASE}/jobs`, async () => {
    const jobs = await db.jobs.toArray();
    return HttpResponse.json(jobs);
  }),

  http.get(`${BASE}/jobs/:jobId`, async ({ params }) => {
    const job = await db.jobs.get(params.jobId);
    return HttpResponse.json(job);
  }),

  http.get(`${BASE}/candidates`, async ({ request }) => {
    const url = new URL(request.url);
    const jobId = url.searchParams.get('jobId');
    const stage = url.searchParams.get('stage');
    
    let query = db.candidates;
    if (jobId) query = query.where({ jobId });
    if (stage) query = query.where({ stage });
    
    const candidates = await query.toArray();
    return HttpResponse.json(candidates);
  }),

  http.get(`${BASE}/candidates/:candidateId`, async ({ params }) => {
    const candidate = await db.candidates.get(params.candidateId);
    return HttpResponse.json(candidate);
  }),
  
  // ---------------- ASSESSMENTS ----------------
  http.get(`${BASE}/assessments/:jobId`, async ({ params }) => {
    const assessment = await db.assessments.get(params.jobId);
    if (!assessment) return new HttpResponse(null, { status: 404 });

    await new Promise(res => setTimeout(res, randomLatency()));
    return HttpResponse.json(assessment);
  }),

  http.put(`${BASE}/assessments/:jobId`, async ({ params, request }) => {
    const body = await request.json();
    if (maybeError()) {
      await new Promise(res => setTimeout(res, randomLatency()));
      return HttpResponse.json({ message: 'Save failed, retry' }, { status: 500 });
    }

    await db.assessments.put({
      ...body,
      jobId: params.jobId,
      updatedAt: new Date().toISOString()
    });

    await new Promise(res => setTimeout(res, randomLatency()));
    return HttpResponse.json({ ok: true });
  }),

  http.post(`${BASE}/assessments/:jobId/submit`, async ({ request }) => {
    await request.json();
    if (maybeError()) {
      await new Promise(res => setTimeout(res, randomLatency()));
      return HttpResponse.json({ message: 'Submission failed, retry' }, { status: 500 });
    }
    
    await new Promise(res => setTimeout(res, randomLatency()));
    return HttpResponse.json({ ok: true });
  })
];
import { setupWorker } from 'msw/browser';
import { http, HttpResponse, delay } from 'msw';
import { db, ensureSeeded } from '../db/db';
import { slugify } from '../utils/slugify';
import { v4 as uuidv4 } from 'uuid';

const BASE = '/api';

function randomLatency() {
  return 200 + Math.floor(Math.random() * 800);
}

function maybeError() {
  return Math.random() < 0.08; // 8%
}

function paginate(array, page = 1, pageSize = 10) {
  const start = (page - 1) * pageSize;
  return array.slice(start, start + pageSize);
}

export async function startMsw() {
  await ensureSeeded();

  const handlers = [
    // ---------------- JOBS ----------------
    http.get(`${BASE}/jobs`, async ({ request }) => {
      const url = new URL(request.url);
      const search = url.searchParams.get('search') || '';
      const status = url.searchParams.get('status') || '';
      const page = Number(url.searchParams.get('page') || '1');
      const pageSize = Number(url.searchParams.get('pageSize') || '10');
      const sort = url.searchParams.get('sort') || 'order';

      let jobs = await db.jobs.toArray();

      if (search) jobs = jobs.filter(j => j.title.toLowerCase().includes(search.toLowerCase()));
      if (status) jobs = jobs.filter(j => j.status === status);

      jobs.sort((a, b) => (a[sort] ?? 0) - (b[sort] ?? 0));

      const total = jobs.length;
      const data = paginate(jobs, page, pageSize);

      await delay(randomLatency());
      return HttpResponse.json({ data, total });
    }),

    http.get(`${BASE}/jobs/:id`, async ({ params }) => {
      const job = await db.jobs.get(params.id);
      if (!job) return new HttpResponse(null, { status: 404 });

      await delay(randomLatency());
      return HttpResponse.json(job);
    }),

    http.post(`${BASE}/jobs`, async ({ request }) => {
      const body = await request.json();
      if (!body.title) return HttpResponse.json({ message: 'title required' }, { status: 400 });

      const slug = slugify(body.slug || body.title);
      const existing = await db.jobs.where('slug').equalsIgnoreCase(slug).first();
      if (existing) return HttpResponse.json({ message: 'slug must be unique' }, { status: 409 });

      const order = await db.jobs.count();
      const job = {
        id: uuidv4(),
        title: body.title,
        slug,
        status: 'active',
        tags: body.tags || [],
        order,
        createdAt: new Date().toISOString()
      };

      await db.jobs.add(job);
      await delay(randomLatency());
      return HttpResponse.json(job, { status: 201 });
    }),

    http.patch(`${BASE}/jobs/:id`, async ({ params, request }) => {
      const body = await request.json();
      const job = await db.jobs.get(params.id);
      if (!job) return new HttpResponse(null, { status: 404 });

      const updated = { ...job, ...body };
      if (body.slug) {
        const slug = slugify(body.slug);
        const existing = await db.jobs.where('slug').equalsIgnoreCase(slug).first();
        if (existing && existing.id !== params.id) {
          return HttpResponse.json({ message: 'slug must be unique' }, { status: 409 });
        }
        updated.slug = slug;
      }

      await db.jobs.put(updated);
      await delay(randomLatency());
      return HttpResponse.json(updated);
    }),

    http.patch(`${BASE}/jobs/:id/reorder`, async ({ params, request }) => {
      const body = await request.json();
      if (maybeError()) {
        await delay(randomLatency());
        return HttpResponse.json({ message: 'Reorder failed, please retry' }, { status: 500 });
      }

      const { toOrder } = body;
      const jobs = await db.jobs.orderBy('order').toArray();
      const moving = jobs.find(j => j.id === params.id);
      if (!moving) return new HttpResponse(null, { status: 404 });

      const without = jobs.filter(j => j.id !== params.id);
      without.splice(toOrder, 0, moving);

      await db.transaction('rw', db.jobs, async () => {
        for (let i = 0; i < without.length; i++) {
          await db.jobs.update(without[i].id, { order: i });
        }
      });

      await delay(randomLatency());
      return HttpResponse.json({ ok: true });
    }),

    // ---------------- CANDIDATES ----------------
    http.get(`${BASE}/candidates`, async ({ request }) => {
      const url = new URL(request.url);
      const search = (url.searchParams.get('search') || '').toLowerCase();
      const stage = url.searchParams.get('stage') || '';
      const page = Number(url.searchParams.get('page') || '1');
      const pageSize = Number(url.searchParams.get('pageSize') || '50');

      let candidates = await db.candidates.toArray();

      if (search) {
        candidates = candidates.filter(c =>
          c.name.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search) ||
          (c.skills || []).some(s => s.toLowerCase().includes(search))
        );
      }
      if (stage) candidates = candidates.filter(c => c.stage === stage);

      const total = candidates.length;
      const data = paginate(candidates, page, pageSize);

      const augmented = data.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        jobId: c.jobId,
        job: c.job || 'Unknown',
        stage: c.stage || 'N/A',
        experience: c.experience ?? 0,
        skills: c.skills?.length ? c.skills : ['N/A'],
        location: c.location || 'Unknown',
        notes: c.notes || [],
        timeline: c.timeline || []
      }));

      await delay(randomLatency());
      return HttpResponse.json({ data: augmented, total });
    }),

    http.get(`${BASE}/candidates/:id/timeline`, async ({ params }) => {
      const candidate = await db.candidates.get(params.id);
      if (!candidate) return new HttpResponse(null, { status: 404 });

      await delay(randomLatency());
      return HttpResponse.json(candidate.timeline || []);
    }),

http.patch(`${BASE}/candidates/:id`, async ({ params, request }) => {
  const body = await request.json();
  const candidate = await db.candidates.get(params.id);
  if (!candidate) return new HttpResponse(null, { status: 404 });

  const updated = { ...candidate, ...body };

  // Stage change
  if (body.stage && body.stage !== candidate.stage) {
    const entry = {
      id: uuidv4(),  // <- unique timeline entry
      candidateId: candidate.id,
      at: new Date().toISOString(),
      from: candidate.stage,
      to: body.stage,
      note: 'Stage changed'
    };
    updated.timeline = [...(candidate.timeline || []), entry];
  }

  // New notes
  if (body.notes && body.notes.length > (candidate.notes?.length || 0)) {
    const newNotes = body.notes.slice(candidate.notes?.length || 0);
    const noteEntries = newNotes.map(n => ({
      id: uuidv4(),       // <- unique timeline entry
      candidateId: candidate.id,
      at: n.createdAt,
      from: 'Note',
      to: 'Added',
      note: n.text
    }));
    updated.timeline = [...(updated.timeline || []), ...noteEntries];
  }

  await db.candidates.put(updated);
  await delay(randomLatency());
  return HttpResponse.json(updated);
}),


    // ---------------- ASSESSMENTS ----------------
    http.get(`${BASE}/assessments/:jobId`, async ({ params }) => {
      const assessment = await db.assessments.get(params.jobId);
      if (!assessment) return new HttpResponse(null, { status: 404 });

      await delay(randomLatency());
      return HttpResponse.json(assessment);
    }),

    http.put(`${BASE}/assessments/:jobId`, async ({ params, request }) => {
      const body = await request.json();
      if (maybeError()) {
        await delay(randomLatency());
        return HttpResponse.json({ message: 'Save failed, retry' }, { status: 500 });
      }

      await db.assessments.put({
        ...body,
        jobId: params.jobId,
        updatedAt: new Date().toISOString()
      });

      await delay(randomLatency());
      return HttpResponse.json({ ok: true });
    }),

    http.post(`${BASE}/assessments/:jobId/submit`, async ({ request }) => {
      await request.json();
      await delay(randomLatency());
      return HttpResponse.json({ ok: true });
    })
  ];

  const worker = setupWorker(...handlers);
  await worker.start({ serviceWorker: { url: '/mockServiceWorker.js' } });
}

import { v4 as uuidv4 } from "uuid";
const jobs = new Map(); // jobId -> job object

export function createJob({ sessionId, params }) {
  const jobId = uuidv4();
  const job = {
    jobId,
    sessionId,
    params,
    status: "queued", // queued | running | paused | cancelled | completed | failed
    progress: 0,
    result: null,
    error: null,
    control: { pause: false, cancel: false },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  jobs.set(jobId, job);
  return job;
}

export function getJob(jobId) {
  return jobs.get(jobId);
}

export function updateJob(jobId, patch) {
  const job = jobs.get(jobId);
  if (!job) return null;
  Object.assign(job, patch);
  job.updatedAt = Date.now();
  return job;
}

export function setJobControl(jobId, controlPatch) {
  const job = jobs.get(jobId);
  if (!job) return null;
  Object.assign(job.control, controlPatch);
  job.updatedAt = Date.now();
  return job;
}

export function listJobs() {
  return Array.from(jobs.values());
}

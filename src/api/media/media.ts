import { apiFetch } from "@/lib/fetch";
import type { TMediaProcessingJob } from "./media-types";

const MEDIA_JOB_POLL_INTERVAL_MS = 750;
const MEDIA_JOB_POLL_TIMEOUT_MS = 60_000;

export async function getMediaJobs() {
	return apiFetch<TMediaProcessingJob[]>("media/jobs");
}

export async function getMediaJob(jobId: string) {
	return apiFetch<TMediaProcessingJob>(`media/jobs/${jobId}`);
}

export async function uploadMedia(files: File[]) {
	if (files.length === 0) {
		return [];
	}

	const formData = new FormData();

	for (const file of files) {
		formData.append("files", file);
	}

	return apiFetch<TMediaProcessingJob[]>("media/upload", {
		method: "POST",
		body: formData,
	});
}

export async function waitForMediaJob(
	jobId: string,
	options: {
		pollIntervalMs?: number;
		timeoutMs?: number;
	} = {},
) {
	const pollIntervalMs =
		options.pollIntervalMs ?? MEDIA_JOB_POLL_INTERVAL_MS;
	const timeoutMs = options.timeoutMs ?? MEDIA_JOB_POLL_TIMEOUT_MS;
	const startedAt = Date.now();
	let lastError: unknown = null;

	while (Date.now() - startedAt < timeoutMs) {
		try {
			const job = await getMediaJob(jobId);
			const status = normalizeMediaJobStatus(job.status);

			if (status === "COMPLETED") {
				return job;
			}

			if (status === "FAILED" || status === "ERROR") {
				throw new Error(
					job.errorMessage || `Media processing failed for job ${jobId}.`,
				);
			}
		} catch (error) {
			// Some backends return the upload response before the job is queryable.
			// Keep polling until the timeout instead of sending a job id that chat cannot resolve.
			lastError = error;
		}

		await sleep(pollIntervalMs);
	}

	if (lastError instanceof Error) {
		throw new Error(
			`Media job ${jobId} was not ready before timeout. Last error: ${lastError.message}`,
		);
	}

	throw new Error(`Media job ${jobId} was not ready before timeout.`);
}

export async function waitForMediaJobs(jobIds: string[]) {
	if (jobIds.length === 0) {
		return [];
	}

	return Promise.all(jobIds.map((jobId) => waitForMediaJob(jobId)));
}

export async function uploadMediaAndGetJobIds(files: File[]) {
	const jobs = await uploadMedia(files);
	const jobIds = jobs
		.map((job) => job.jobId)
		.filter((jobId): jobId is string => Boolean(jobId));

	if (jobIds.length !== files.length) {
		throw new Error("Media upload accepted, but not every file returned a job id.");
	}

	await waitForMediaJobs(jobIds);

	return jobIds;
}

function normalizeMediaJobStatus(status: string | null | undefined) {
	return (status ?? "").trim().toUpperCase();
}

function sleep(ms: number) {
	return new Promise((resolve) => window.setTimeout(resolve, ms));
}

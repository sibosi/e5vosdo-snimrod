// lib/parallelProcessor.ts
// Parallel image processing utility using controlled concurrency

import * as os from "os";

export interface ProcessTask<T> {
  data: T;
  index: number;
}

export interface ProcessResult<T> {
  success: boolean;
  data: T;
  error?: string;
}

/**
 * Process items in parallel with controlled concurrency
 * Uses all available CPU cores by default
 */
export async function processInParallel<T>(
  items: T[],
  processor: (item: T, index: number) => Promise<void>,
  options: {
    concurrency?: number;
    onProgress?: (current: number, total: number) => void;
  } = {},
): Promise<{ processed: number; errors: string[] }> {
  const concurrency = options.concurrency || os.cpus().length;
  const total = items.length;
  let current = 0;
  const errors: string[] = [];

  // Create a queue of tasks
  const queue: ProcessTask<T>[] = items.map((data, index) => ({
    data,
    index,
  }));

  // Worker function that processes items from the queue
  const worker = async (): Promise<void> => {
    while (queue.length > 0) {
      const task = queue.shift();
      if (!task) break;

      try {
        await processor(task.data, task.index);
        current++;
        if (options.onProgress) {
          options.onProgress(current, total);
        }
      } catch (error: any) {
        errors.push(`Item ${task.index}: ${error?.message || "Unknown error"}`);
        current++;
        if (options.onProgress) {
          options.onProgress(current, total);
        }
      }
    }
  };

  // Start workers (one per CPU core, or as specified)
  const workers: Promise<void>[] = [];
  for (let i = 0; i < Math.min(concurrency, items.length); i++) {
    workers.push(worker());
  }

  // Wait for all workers to complete
  await Promise.all(workers);

  return { processed: current, errors };
}

/**
 * Batch items into chunks for processing
 * Useful when you want to process items in batches rather than individually
 */
export function batchItems<T>(items: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  return batches;
}

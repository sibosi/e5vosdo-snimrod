// lib/globalProgress.ts
// Global progress tracker for all media admin operations
// Centralizes progress state to prevent UI jumping between different endpoints

export type OperationType =
  | "batch"
  | "sync"
  | "generate-colors"
  | "extract-exif"
  | "cache-drive"
  | "cache-local";

export interface ProgressState {
  running: boolean;
  current: number;
  total: number;
  currentFile: string;
  phase: string;
  operationType: OperationType | null;
  options?: Record<string, any>;
  stats?: Record<string, number>;
  errors: string[];
  startedAt: Date | null;
}

// Global progress state - shared across all operations
const globalProgress: ProgressState = {
  running: false,
  current: 0,
  total: 0,
  currentFile: "",
  phase: "",
  operationType: null,
  options: {},
  stats: {},
  errors: [],
  startedAt: null,
};

export function getGlobalProgress(): ProgressState {
  return { ...globalProgress };
}

export function isOperationRunning(): boolean {
  return globalProgress.running;
}

export function startOperation(
  type: OperationType,
  options?: Record<string, any>,
): boolean {
  if (globalProgress.running) {
    return false; // Operation already in progress
  }

  globalProgress.running = true;
  globalProgress.current = 0;
  globalProgress.total = 0;
  globalProgress.currentFile = "Initializing...";
  globalProgress.phase = "init";
  globalProgress.operationType = type;
  globalProgress.options = options || {};
  globalProgress.stats = {};
  globalProgress.errors = [];
  globalProgress.startedAt = new Date();

  return true;
}

export function updateProgress(updates: Partial<ProgressState>): void {
  Object.assign(globalProgress, updates);
}

export function setTotal(total: number): void {
  globalProgress.total = total;
}

export function setCurrent(current: number): void {
  globalProgress.current = current;
}

export function setCurrentFile(file: string): void {
  globalProgress.currentFile = file;
}

export function setPhase(phase: string): void {
  globalProgress.phase = phase;
}

export function incrementStat(statName: string, increment: number = 1): void {
  if (!globalProgress.stats) {
    globalProgress.stats = {};
  }
  globalProgress.stats[statName] =
    (globalProgress.stats[statName] || 0) + increment;
}

export function addError(error: string): void {
  globalProgress.errors.push(error);
}

export function completeOperation(finalMessage: string = "Done!"): void {
  globalProgress.running = false;
  globalProgress.currentFile = finalMessage;
  globalProgress.phase = "done";
}

export function failOperation(errorMessage: string): void {
  globalProgress.running = false;
  globalProgress.phase = "error";
  globalProgress.errors.push(errorMessage);
}

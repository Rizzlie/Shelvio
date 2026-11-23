/** Where Identity reads the time, so tests can move it (spec: "the clock" seam). */
export interface Clock {
  now(): Date;
}

export const systemClock: Clock = { now: () => new Date() };

export type Hours = number;
export type Minutes = number;
export type Seconds = number;
export type Timespan = `${Hours}:${Minutes}:${Seconds}`;

export const convertTimespanToSeconds = (timespan: Timespan): Seconds => {
  const [hours, minutes, seconds] = timespan.split(':');
  return (Number(hours) * 60 * 60) + (Number(minutes) * 60) + Number(seconds);
};

export const executionTimeoutNearlyReached = (startDateTime: Date, timeout: Seconds, timeoutBuffer: Seconds): boolean => {
  const startTime: Seconds = startDateTime.getTime() / 1000;
  const now: Seconds = new Date().getTime() / 1000;
  const elapsedTime = now - startTime;
  return (elapsedTime >= (timeout - timeoutBuffer));
};

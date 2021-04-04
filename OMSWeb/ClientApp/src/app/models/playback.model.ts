export interface IPlaybackOptions {
  startAt?: Date;
  endAt?: Date;
  speed?: number;
  eventsStep?: number;
  snapshot?: number;
  event?: number;
}

export const playbackSpeedValues = [0.1, 0.5, 1, 2, 5, 10];

export interface IPlaybackState {
  playing: boolean;
  playTime?: string;
  event?: number;
  nextEvent?: number;
  error?: string;
}

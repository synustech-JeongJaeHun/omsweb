import { Dto } from './dto/track.model';
import { IOrderStatusRow } from './order-status.model';

export interface IPlaybackOptions {
  startAt?: Date;
  endAt?: Date;
  maxTime?: Date;
  speed?: number;
  eventsStep?: number;
  snapshotMax?: number;
  event?: number;
}

export const playbackSpeedValues = [0.1, 0.5, 1, 2, 5, 10];

export interface IPlaybackState {
  playing: boolean;
  playTime?: string;
  event?: number;
  nextEvent?: number;
  error?: string;
  snapshot?:number;
}

export interface ITimelineQueryOptions {
  start?: Date;
  end?: Date;
}

export interface ITimeline {
  id: number;
  eventTime: Date;
  eventId: number;
  tableName: string;
}

export interface IPlaybackData extends Dto.ITrackData {
  dynamicSnapshotList?: Date[];
  eventTables?: any;
  orders?: IOrderStatusRow[];
  timeline?: ITimeline[];
  trackSnapshot?: Date;
}

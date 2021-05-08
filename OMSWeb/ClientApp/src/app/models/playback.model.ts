import { Dto } from './dto/track.model';
import { IOrderStatusRow } from './order-status.model';

export interface IPlaybackOptions {
  startAt?: Date;
  endAt?: Date;
  maxTime?: Date;
  speed?: number;
  snapshotMax?: number;
  eventMax?: number;
  nextEvent?: number;
}

export const playbackSpeedValues = [0.1, 0.5, 1, 2, 5, 10];

export interface IPlaybackState {
  playing: boolean;
  playTime?: Date;
  lastSnapshot?: number;
  event?: number;
  snapshot?: number;
  nextEvent?: number;
  error?: string;
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

export interface ISnapshotData extends Dto.IVariableTrackData {
  timeline?: ITimeline[];
  eventTables?: any;
  orders?: IOrderStatusRow[];
}
export interface IPlaybackData extends ISnapshotData, Dto.IFixedTrackData {
  dynamicSnapshotList?: Date[];
  trackSnapshot?: Date;
}

export interface IPlaybackTrackChangeEvent {
  table: string;
  data: any;
  id: number;
  skipRender: boolean;
  operation: string;
  useVehicleChangedProps?: boolean;
}

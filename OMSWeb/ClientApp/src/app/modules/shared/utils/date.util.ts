import * as moment from 'moment';

export namespace DateUtil {
  export const DateFormat = 'yyyy-MM-dd';
  export const TimeFormat = 'HH:mm:ss';
  export const TimeFormatShort = 'HH:mm';
  export const DateTimeFormat = `${DateFormat} ${TimeFormat}`;
  export const DateTimeFormatShort = `${DateFormat} ${TimeFormatShort}`;

  export const toISOString = (date: string | Date): string => {
    if (date instanceof Date) return date.toISOString();
    else return moment(date).toISOString();
  };
}

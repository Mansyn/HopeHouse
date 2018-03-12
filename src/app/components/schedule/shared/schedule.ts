import { Event } from './event';

export class Schedule {
    $key: string;
    title: string;
    description: string;
    timeStamp: number;
    active: boolean = true;
    events: Event[];
}
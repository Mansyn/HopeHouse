import { Event } from '../../components/scheduler/shared/event';

export class Schedule {
    $key: string;
    title: string;
    description: string;
    timeStamp: number;
    location: string;
    color: string;
    active: boolean = true;
    events: Event[];
}
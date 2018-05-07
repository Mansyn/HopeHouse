export class Event {
    $key: string;
    schedule_key: string;
    user: string;
    start: string;
    end: string;
    type: string;
    primary: string;
    secondary: string;
    timeStamp: string;
}

export enum EventType {
    Serve = 'Serve',
    Supply = 'Supply'
}
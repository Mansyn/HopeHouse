import { Schedule } from "./schedule";

export class Location {
    $key: string;
    name: string;
    address: string;
    phone: number;
    active: boolean = true;
    events: Schedule[];
}

export interface Roles {
    subscriber?: boolean;
    volunteer?: boolean;
    admin?: boolean;
}

export interface User {
    uid: string;
    email: string;
    photoURL: string;
    roles: Roles;
}

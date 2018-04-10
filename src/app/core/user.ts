
export interface Roles {
    subscriber?: boolean;
    volunteer?: boolean;
    admin?: boolean;
}

export interface User {
    uid: string;
    displayName: string;
    email: string;
    phoneNumber: string;
    photoURL: string;
    roles: Roles;
}

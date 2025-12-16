export interface User {
    id: string;
    email: string;
    name: string;
    password: string;
}

export interface SafeUser {
    id: string;
    email: string;
    name: string;
}

export interface FileItem {
    id: string;
    name: string;
    type: 'file' | 'dir';
    parent: string | null;
    userId: string;
    content?: string;
    mime?: string;
    size?: number;
    modified?: number;
}

export type Theme = 'light' | 'dark';
export type Lang = 'en' | 'ru';

export interface AuthResponse {
    token: string;
    user: SafeUser;
}

export interface ApiErrorResponse {
    message: string;
    status: number;
}


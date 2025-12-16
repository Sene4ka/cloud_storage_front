import { browser } from '$app/environment';
import type { Theme, Lang, SafeUser } from './types';

function loadFromStorage<T>(key: string, fallback: T): T {
    if (!browser) return fallback;
    try {
        const stored = localStorage.getItem(key);
        if (stored === null) return fallback;

        try {
            return JSON.parse(stored) as T;
        } catch (e) {
            return (stored as unknown) as T;
        }
    } catch (e) {
        console.warn(`[Storage] Failed to load "${key}"`, e);
        return fallback;
    }
}

function saveToStorage<T>(key: string, value: T): void {
    if (!browser) return;

    try {
        if (typeof value === 'string') {
            localStorage.setItem(key, value);
        } else {
            localStorage.setItem(key, JSON.stringify(value));
        }
    } catch (e) {
        console.error(`[Storage] Failed to save "${key}"`, e);
    }
}

export class PersistentState<T> {
    #state: T;
    #key: string;

    constructor(key: string, initialValue: T) {
        this.#key = key;
        this.#state = $state(loadFromStorage(key, initialValue));
    }

    get value(): T {
        return this.#state;
    }

    set value(newValue: T) {
        this.#state = newValue;
        saveToStorage(this.#key, newValue);
    }
}

export const token = new PersistentState<string>('token', '');
export const user = new PersistentState<SafeUser | null>('user', null);
export const lang = new PersistentState<Lang>('lang', 'ru');
export const theme = new PersistentState<Theme>('theme', 'dark');

export function isAuthenticated(): boolean {
    return !!token.value;
}


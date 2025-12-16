import type { User, SafeUser, FileItem, AuthResponse } from './types';

const STORAGE_KEYS = {
    USERS: 'mock_users',
    FILES: 'mock_files',
} as const;

const DELAYS = {
    AUTH: 120,
    LIST: 200,
    GET: 160,
    CREATE: 180,
    SAVE: 160,
    DELETE: 120,
    MOVE: 120,
} as const;

class MockStorage {
    private ensureMockData() {
        const hasUsers = !!this.get<User[]>(STORAGE_KEYS.USERS);

        if (!hasUsers) {
            this.set(STORAGE_KEYS.USERS, [{
                id: 'u1',
                email: 'user@example.com',
                name: 'Demo',
                password: 'demo'
            }]);
        }
    }

    private get<T>(key: string): T | null {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch {
            return null;
        }
    }

    private set(key: string, value: unknown) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    getUsers(): User[] {
        this.ensureMockData();
        return this.get<User[]>(STORAGE_KEYS.USERS) || [];
    }

    getFiles(): FileItem[] {
        this.ensureMockData();
        return this.get<FileItem[]>(STORAGE_KEYS.FILES) || [];
    }

    saveUsers(users: User[]) { this.set(STORAGE_KEYS.USERS, users); }
    saveFiles(files: FileItem[]) { this.set(STORAGE_KEYS.FILES, files); }
}

const mock = new MockStorage();

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
const generateId = () => `mock-${Math.random().toString(36).slice(2, 9)}`;
const extractUserId = (token: string) => token.replace('mock-jwt-', '');

export default class ApiError extends Error {
    constructor(message: string, public status: number = 400) {
        super(message);
        this.name = 'ApiError';
    }
}

export async function register(
    email: string,
    name: string,
    password: string
): Promise<AuthResponse> {
    await delay(DELAYS.AUTH);

    const users = mock.getUsers();

    const exists = users.some(u => u.email === email);
    if (exists) {
        throw new ApiError('User already exists', 409);
    }

    const user: User = {
        id: generateId(),
        email,
        name,
        password
    };

    mock.saveUsers([...users, user]);

    const token = `mock-jwt-${user.id}`;
    localStorage.setItem('token', token);

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name
        }
    };
}


export async function login(
    email: string,
    password: string
): Promise<AuthResponse> {
    await delay(DELAYS.AUTH);

    const user = mock
        .getUsers()
        .find(u => u.email === email && u.password === password);

    if (!user) {
        throw new ApiError('Invalid credentials', 401);
    }

    const token = `mock-jwt-${user.id}`;
    localStorage.setItem('token', token);

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name
        }
    };
}


export async function whoami(): Promise<SafeUser> {
    await delay(DELAYS.AUTH);

    const token = localStorage.getItem('token');
    if (!token) {
        throw new ApiError('Not authenticated', 401);
    }

    const userId = extractUserId(token);

    const user = mock
        .getUsers()
        .find(u => u.id === userId);

    if (!user) {
        throw new ApiError('User not found', 404);
    }

    return {
        id: user.id,
        email: user.email,
        name: user.name
    };
}


function requireUserId(): string {
    const token = localStorage.getItem('token');
    if (!token) throw new ApiError('Not authenticated', 401);
    return extractUserId(token);
}


export async function listFiles(parent = 'root'): Promise<FileItem[]> {
    await delay(DELAYS.LIST);
    const userId = requireUserId();

    return mock
        .getFiles()
        .filter(f => f.userId === userId && f.parent === parent);
}

export async function getFile(id: string): Promise<FileItem> {
    await delay(DELAYS.GET);
    const userId = requireUserId();

    const file = mock
        .getFiles()
        .find(f => f.id === id && f.userId === userId);

    if (!file) throw new ApiError('File not found', 404);
    return file;
}


export async function createFile(
    name: string,
    parent = 'root',
    type: 'file' | 'dir' = 'file'
): Promise<FileItem> {
    await delay(DELAYS.CREATE);
    const userId = requireUserId();
    const now = Date.now();

    const file: FileItem = {
        id: generateId(),
        name,
        type,
        parent,
        userId,
        content: type === 'file' ? '' : undefined,
        size: type === 'file' ? 0 : undefined,
        modified: now
    };

    mock.saveFiles([...mock.getFiles(), file]);
    return file;
}

export async function saveFile(id: string, content: string): Promise<FileItem> {
    await delay(DELAYS.SAVE);
    const userId = requireUserId();
    const files = mock.getFiles();

    const file = files.find(f => f.id === id && f.userId === userId);
    if (!file) throw new ApiError('File not found', 404);

    const updated: FileItem = {
        ...file,
        content,
        size: content.length,
        modified: Date.now()
    };

    mock.saveFiles(files.map(f => f.id === id ? updated : f));
    return updated;
}


export async function renameFile(id: string, newName: string): Promise<FileItem> {
    await delay(DELAYS.SAVE);
    const userId = requireUserId();

    newName = newName.trim();
    if (!newName) {
        throw new ApiError('Name cannot be empty', 400);
    }

    const files = mock.getFiles();
    const file = files.find(f => f.id === id && f.userId === userId);
    if (!file) {
        throw new ApiError('File not found', 404);
    }

    const conflict = files.find(f =>
        f.userId === userId &&
        f.parent === file.parent &&
        f.name === newName &&
        f.id !== id
    );

    if (conflict) {
        throw new ApiError('File with this name already exists', 409);
    }

    const updated: FileItem = {
        ...file,
        name: newName,
        modified: Date.now()
    };

    mock.saveFiles(files.map(f => f.id === id ? updated : f));
    return updated;
}


export async function deleteFile(id: string): Promise<void> {
    await delay(DELAYS.DELETE);
    const userId = requireUserId();
    const files = mock.getFiles();

    const exists = files.some(f => f.id === id && f.userId === userId);
    if (!exists) throw new ApiError('File not found', 404);

    mock.saveFiles(files.filter(f => !(f.id === id && f.userId === userId)));
}


export async function moveFile(id: string, newParent: string): Promise<FileItem> {
    await delay(DELAYS.MOVE);
    const userId = requireUserId();
    const files = mock.getFiles();

    const file = files.find(f => f.id === id && f.userId === userId);
    if (!file) throw new ApiError('File not found', 404);

    const updated: FileItem = {
        ...file,
        parent: newParent,
        modified: Date.now()
    };

    mock.saveFiles(files.map(f => f.id === id ? updated : f));
    return updated;
}


export const MINIO_URL_BASE = 'https://minio.example.com/bucket' as const;


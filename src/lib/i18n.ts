import { lang } from './stores.svelte';

const dict = {
    en: {
        login: 'Login',
        loginBtn: 'Sign In',
        register: 'Register',
        registerBtn: 'Sign Up',
        email: 'Email',
        password: 'Password',
        files: 'Files',
        search: 'Search',
        searchText: 'Press Enter to Search',
        profile: 'Profile',
        logout: 'Logout',
        newFile: 'New file',
        newDir: 'New folder',
        itemOne: 'item',
        item: 'items',
        items: 'items',
        name: 'Name',
        date: 'Date',
        size: 'Size',
        modified: 'Modified',
        noFiles: 'No files',
        myFiles: 'My Files',
        page: 'Page',
        of: 'of',
        createAccount: 'Create Account',
        alreadyHaveAccount: 'Already have an account?',
        loading: 'Loading...',
        creating: 'Creating...',
        create: 'Create',
        cancel: 'Cancel',
        save: 'Save',
        download: 'Download',
        rename: 'Rename',
        close: 'Close',
        forward: 'Forward',
        back: 'Back',
        fileNotFound: 'File not found',
        delete: 'Delete',
        edit: 'Edit',
        upload: 'Upload',
        file: 'File',
        dir: 'Folder',
        open: 'Open',
    },
    ru: {
        login: 'Вход',
        loginBtn: 'Войти',
        register: 'Регистрация',
        registerBtn: 'Зарегистрироваться',
        email: 'Почта',
        password: 'Пароль',
        files: 'Файлы',
        search: 'Поиск',
        searchText: 'Нажмите Enter для поиска',
        profile: 'Профиль',
        logout: 'Выйти',
        newFile: 'Новый Файл',
        newDir: 'Новую Папку',
        itemOne: 'элемент',
        item: 'элемента',
        items: 'элементов',
        name: 'Имя',
        date: 'Дата',
        size: 'Размер',
        modified: 'Изменен',
        noFiles: 'Нет Файлов',
        myFiles: 'Мои Файлы',
        page: 'Страница',
        of: 'из',
        createAccount: 'Создать аккаунт',
        alreadyHaveAccount: 'Уже есть аккаунт?',
        loading: 'Загрузка...',
        creating: 'Создание...',
        create: 'Создать',
        cancel: 'Отмена',
        save: 'Сохранить',
        download: 'Скачать',
        rename: 'Переименовать',
        close: 'Закрыть',
        forward: 'Вперед',
        back: 'Назад',
        fileNotFound: 'Файл не найден',
        delete: 'Удалить',
        edit: 'Редактировать',
        upload: 'Загрузить',
        file: 'Файл',
        dir: 'Папка',
        open: 'Открыть',
    }
} as const;

type LangCode = keyof typeof dict;
type TranslationKey = keyof typeof dict[LangCode];

function isValidLang(code: string): code is LangCode {
    return code in dict;
}

function getCurrentLang(): LangCode {
    const current = lang.value;
    return isValidLang(current) ? current : 'en';
}

export function t(key: TranslationKey): string {
    const currentLang = getCurrentLang();
    return dict[currentLang][key] ?? key;
}


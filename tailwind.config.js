/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        extend: {
            colors: {
                'bg': 'var(--color-bg)',
                'bg-secondary': 'var(--color-bg-secondary)',
                'card': 'var(--color-card)',
                'card-hover': 'var(--color-card-hover)',
                'text': 'var(--color-text)',
                'text-secondary': 'var(--color-text-secondary)',
                'primary': 'var(--color-primary)',
                'primary-hover': 'var(--color-primary-hover)',
                'success': 'var(--color-success)',
                'warning': 'var(--color-warning)',
                'error': 'var(--color-error)',
                'border': 'var(--color-border)',
                'border-light': 'var(--color-border-light)',
                'accent': 'var(--color-accent)',
                'surface': 'var(--color-surface)',
                'icon': 'var(--color-icon)',
            },
            backgroundColor: {
                'primary': 'var(--color-primary)',
                'card': 'var(--color-card)',
                'surface': 'var(--color-surface)',
            },
            textColor: {
                'primary': 'var(--color-primary)',
                'text': 'var(--color-text)',
                'secondary': 'var(--color-text-secondary)',
                'error': 'var(--color-error)',
            },
            borderColor: {
                DEFAULT: 'var(--color-border)',
                'light': 'var(--color-border-light)',
            },
            ringColor: {
                DEFAULT: 'var(--color-primary)',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': {
                        opacity: '0',
                        transform: 'translateY(10px)'
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateY(0)'
                    },
                },
            },
        },
    },
    plugins: [],
}
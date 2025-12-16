<script lang="ts">
    import type {Snippet} from 'svelte';
    import {browser} from '$app/environment';
    import {theme} from '$lib/stores.svelte';
    import '../app.css';
    import type {Theme} from "$lib/types";

    interface Props {
        children?: Snippet;
    }

    let { children }: Props = $props();

    $effect(() => {
        if (!browser) return;

        const saved = localStorage.getItem('theme');
        let initialTheme: Theme;

        if (saved === 'light' || saved === 'dark') {
            initialTheme = saved;
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            initialTheme = prefersDark ? 'dark' : 'light';
        }

        theme.value = initialTheme;

        document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    });

    $effect(() => {
        if (!browser) return;

        localStorage.setItem('theme', theme.value);

        document.documentElement.classList.toggle('dark', theme.value === 'dark');
    });
</script>

<svelte:head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

{@render children?.()}


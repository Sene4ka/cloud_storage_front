<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import type { FileItem } from '$lib/types';
    import * as api from '$lib/api';
    import {t} from "$lib/i18n";

    interface Props {
        file: FileItem;
        close: () => void;
    }

    let { file, close }: Props = $props();

    let content = $state('');
    let isSaving = $state(false);
    let dialogEl: HTMLDivElement | null = null;

    $effect(() => {
        content = file.content ?? '';
    });

    async function save() {
        if (isSaving) return;
        isSaving = true;
        await api.saveFile(file.id, content);
        isSaving = false;
        close();
    }

    function handleKey(e: KeyboardEvent) {
        if (e.key === 'Escape') close();
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') save();
    }

    onMount(() => {
        window.addEventListener('keydown', handleKey);
        dialogEl?.focus();
    });

    onDestroy(() => {
        window.removeEventListener('keydown', handleKey);
    });
</script>

<button
        type="button"
        class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        aria-label="Close editor"
        onclick={close}
></button>

<div
        bind:this={dialogEl}
        class="fixed inset-0 z-50 m-auto max-w-3xl h-[70vh] bg-card rounded-xl p-4 flex flex-col outline-none"
        role="dialog"
        aria-modal="true"
        tabindex="0"
>
    <header class="flex justify-between items-center mb-2">
        <h2 class="text-lg font-semibold">{file.name}</h2>
        <button type="button" onclick={close}>✕</button>
    </header>

    <textarea
            class="flex-1 resize-none bg-surface text-text rounded-md p-2"
            bind:value={content}
    ></textarea>

    <footer class="flex justify-end space-around gap-2 mt-4">
        <button type="button" class="px-4 py-2 rounded-lg" onclick={close}>
            {t('cancel')}
        </button>
        <button type="button" class="px-4 py-2 rounded-lg bg-primary" onclick={save} disabled={isSaving}>
            {t('save')}
        </button>
    </footer>
</div>




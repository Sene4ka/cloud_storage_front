<script lang="ts">
    import * as api from '$lib/api';
    import type { FileItem } from '$lib/types';
    import { t } from '$lib/i18n';

    export let parent: string;
    export let existing: FileItem[];
    export let onClose: () => void;

    let name = '';
    let type: 'file' | 'dir' = 'file';
    let error = '';

    function validate() {
        if (!name.trim()) return 'Name is required';
        if (existing.some(f => f.name === name)) {
            return 'Name already exists';
        }
        return '';
    }

    async function create() {
        error = validate();
        if (error) return;

        await api.createFile(name, parent, type);
        onClose();
    }
</script>

<button
        type="button"
        class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        aria-label="Close editor"
        onclick={onClose}
></button>

<div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-card p-4 rounded-xl ">
        <h3 class="text-lg font-semibold mb-4">{t('create')}</h3>

        <input
                class="w-full p-2 border rounded-xl bg-surface text-text"
                placeholder="Name"
                bind:value={name}
        >

        <label>
            <input class="mt-4" type="radio" bind:group={type} value="file" />
            {t('newFile')}
        </label>
        <label class="ml-3">
            <input type="radio" bind:group={type} value="dir" />
            {t('newDir')}
        </label>

        {#if error}
            <div class="text-error text-sm mt-1">{error}</div>
        {/if}

        <div class="flex justify-end gap-2 mt-4">
            <button class="px-4 py-2 rounded-lg" onclick={onClose}>{t('cancel')}</button>
            <button class="px-4 py-2 bg-primary rounded-lg" onclick={create}>{t('create')}</button>
        </div>
    </div>
</div>

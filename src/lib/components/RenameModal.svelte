<script lang="ts">
    import type { FileItem } from '$lib/types';
    import * as api from '$lib/api';
    import ApiError from '$lib/api';
    import {t} from "$lib/i18n";

    export let item: FileItem;
    export let existing: FileItem[];
    export let onClose: () => void;

    let name = item.name;
    let error = '';

    function validate(n: string) {
        if (!n.trim()) return 'Имя не может быть пустым';
        if (existing.some(f => f.id !== item.id && f.name === n))
            return 'Файл с таким именем уже существует';
        return '';
    }

    async function save() {
        error = validate(name);
        if (error) return;

        try {
            item.name = name;
            await api.renameFile(item.id, item.name);}
        catch (e) {
            if (e instanceof ApiError && e.status === 409) {
                error = 'Файл с таким именем уже существует';
            } else if (e instanceof ApiError) {
                error = e.message;
            }
        }

        window.dispatchEvent(new CustomEvent('files:changed'));
        onClose();
    }
</script>

<button
        type="button"
        class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        aria-label="Close editor"
        onclick={close}
></button>

<div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="w-96 rounded-xl p-6" style="background: var(--color-card);">
        <h3 class="text-lg font-semibold mb-4">Переименовать</h3>

        <input
                class="w-full p-2 bg-surface rounded-lg"
                bind:value={name}
        />

        {#if error}
            <div class="text-sm mt-2" style="color: var(--color-error);">{error}</div>
        {/if}

        <div class="flex justify-end gap-2 mt-6">
            <button class="px-4 py-2 rounded-lg" onclick={onClose}>{t('cancel')}</button>
            <button
                    class="px-4 py-2 bg-primary rounded-lg"
                    onclick={save}
            >
                {t('save')}
            </button>
        </div>
    </div>
</div>

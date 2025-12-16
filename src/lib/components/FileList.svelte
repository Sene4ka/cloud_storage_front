<script lang="ts">
    import * as api from '$lib/api';
    import EditorModal from './EditorModal.svelte';
    import ContextMenu from './ContextMenu.svelte';
    import RenameModal from './RenameModal.svelte';
    import CreateItemModal from './CreateItemModal.svelte';
    import { t } from '$lib/i18n';
    import type { FileItem } from '$lib/types';
    import { onMount, onDestroy } from 'svelte';
    import { searchQuery } from '$lib/search.svelte';

    let items: FileItem[] = $state([]);
    let currentParent = $state('root');
    let showEditor = $state(false);
    let editing: FileItem | null = $state(null);
    type PathPart = {
        id: string;
        name: string;
    };
    let path = $state<PathPart[]>([
        { id: 'root', name: 'Home' }
    ]);
    let contextMenu: {x: number, y: number, item: FileItem} | null = $state(null);
    let sortBy = $state<'name' | 'modified' | 'size'>('name');
    let sortOrder = $state<'asc' | 'desc'>('asc');
    let selectedFileId = $state<string | null>(null);
    let renaming: FileItem | null = $state(null);

    let search = $state('');
    let showSuggestions = $state(false);

    let currentPage = $state(1);
    let itemsPerPage = $state(7);

    let showCreate = $state(false);

    onMount(() => {
        const onCreate = () => showCreate = true;
        window.addEventListener('ui:create', onCreate);
        return () => window.removeEventListener('ui:create', onCreate);
    });

    async function load(): Promise<void> {
        try {
            const list = await api.listFiles(currentParent);
            items = list.map(it => ({
                ...it,
                size: it.size ?? (it.content ? it.content.length : 0),
                modified: it.modified ?? Date.now()
            }));
            const tp = Math.max(1, Math.ceil(items.length / itemsPerPage));
            if (currentPage > tp) currentPage = 1;
        } catch (error) {
            console.error('Failed to load files:', error);
            items = [];
        }
    }

    onMount(() => {
        load();
        window.addEventListener('files:changed', load as EventListener);
    });

    onDestroy(() => {
        window.removeEventListener('files:changed', load as EventListener);
    });

    const sortedItems = $derived((): FileItem[] => {
        const arr = [...items];
        const dir = sortOrder === 'asc' ? 1 : -1;
        arr.sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name) * dir;
            if (sortBy === 'size') return ((a.size ?? 0) - (b.size ?? 0)) * dir;
            if (sortBy === 'modified') return ((a.modified ?? 0) - (b.modified ?? 0)) * dir;
            return 0;
        });
        return arr;
    });

    const filteredItems = $derived(() => {
        const q = $searchQuery.trim().toLowerCase();
        if (!q) return sortedItems();

        return sortedItems().filter(item =>
            item.name.toLowerCase().includes(q)
        );
    });

    const totalPages = $derived(() =>
        Math.max(1, Math.ceil(filteredItems().length / itemsPerPage))
    );

    const pageNumbers = $derived(() => {
        const tp = totalPages();
        const length = Math.min(5, tp);
        let startPage = currentPage <= 3 ? 1 :
            currentPage >= tp - 2 ? Math.max(1, tp - 4) :
                currentPage - 2;
        startPage = Math.max(1, startPage);
        return Array.from({ length }, (_, i) => startPage + i).filter(page => page <= tp);
    });

    const paginatedItems = $derived(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredItems().slice(startIndex, startIndex + itemsPerPage);
    });

    const suggestions = $derived(() => {
        const q = search.trim().toLowerCase();
        if (!q) return [];

        return items
            .filter(i => i.name.toLowerCase().includes(q))
            .slice(0, 5);
    });

    function getFileIcon(type: string, mime?: string) {
        if (type === 'dir') return '📁';
        return '📄';
    }

    function open(item: FileItem): void {
        selectedFileId = item.id;
        if (item.type === 'file') {
            editing = item;
            showEditor = true;
        } else {
            path = [...path, { id: item.id, name: item.name }];
            currentParent = item.id;
            currentPage = 1;
            load();
        }
    }

    $effect(() => {
        if ($searchQuery) currentPage = 1;
    });

    async function del(item: FileItem): Promise<void> {
        try {
            await api.deleteFile(item.id);
            await load();
        } catch (error) {
            console.error('Failed to delete file:', error);
        }
    }

    function handleContextMenu(e: MouseEvent, item: FileItem): void {
        e.preventDefault();
        contextMenu = { x: e.clientX, y: e.clientY, item };
    }

    function closeContextMenu(): void {
        contextMenu = null;
    }

    function handleSort(column: 'name' | 'modified' | 'size'): void {
        if (sortBy === column) {
            sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            sortBy = column;
            sortOrder = 'asc';
        }
    }

    function handleFileKeydown(e: KeyboardEvent, item: FileItem): void {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            open(item);
        }
    }

    function handleOpen(): void {
        if (contextMenu) open(contextMenu.item);
    }
    function handleDownload(): void {
        if (!contextMenu) return;
        const file = contextMenu.item;
        if (file.type !== 'file') return;

        const blob = new Blob([file.content ?? ''], { type: file.mime ?? 'text' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
        closeContextMenu(); }
    function handleRename(): void {
        if (!contextMenu) return;
        renaming = contextMenu.item;
        closeContextMenu();
    }
    function handleDelete(): void {
        if (contextMenu) {
            del(contextMenu.item);
            closeContextMenu();
        }
    }

    let dragOver = $state(false);

    async function handleDrop(e: DragEvent) {
        e.preventDefault();
        dragOver = false;

        if (!e.dataTransfer?.files.length) return;

        const files = Array.from(e.dataTransfer.files);

        for (const f of files) {
            await api.createFile(f.name, currentParent, 'file');
            // read and load to server when api is done
        }

        await load();
    }

    function handleDragOver(e: DragEvent) {
        e.preventDefault();
        dragOver = true;
    }

    function handleDragLeave() {
        dragOver = false;
    }

    let draggingId: string | null = $state(null);

    function goToPage(page: number): void {
        const tp = totalPages();
        if (page >= 1 && page <= tp) {
            currentPage = page;
        }
    }
    function nextPage(): void { if (currentPage < totalPages()) currentPage++; }
    function prevPage(): void { if (currentPage > 1) currentPage--; }

    function humanSize(bytes = 0) {
        if (bytes < 1024) return `${bytes} B`;
        const units = ['KB','MB','GB','TB'];
        let i = -1;
        do { bytes = bytes / 1024; i++; } while (bytes >= 1024 && i < units.length-1);
        return `${Math.round(bytes*10)/10} ${units[i]}`;
    }
    function fmtDate(ts?: number) {
        if (!ts) return '-';
        return new Date(ts).toLocaleString();
    }
    let isMobile = $state(false);

    onMount(() => {
        const checkMobile = () => {
            isMobile = window.innerWidth < 768;
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    });
</script>

<div class="flex flex-col h-full p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 rounded-xl"
     class:ring-2={dragOver}
     class:ring-primary={dragOver}
     ondragover={handleDragOver}
     ondragleave={handleDragLeave}
     ondrop={handleDrop}
     aria-label="File Drop">

    <div class="p-3 sm:p-4 bg-card rounded-lg sm:rounded-xl border border-border">
        <div class="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-text overflow-x-auto pb-1">
            {#each path as part, i}
                <button
                        type="button"
                        class="hover:opacity-70 transition-opacity rounded px-1 py-0.5 sm:py-1 whitespace-nowrap"
                        ondragover={(e) => e.preventDefault()}
                        class:bg-card-hover={draggingId}
                        class:ring-1={draggingId}
                        ondrop={async (e) => {
                        e.preventDefault();
                        if (!draggingId) return;
                        await api.moveFile(draggingId, part.id);
                        draggingId = null;
                        await load();
                    }}
                        onclick={() => {
                        if (i < path.length - 1) {
                            path = path.slice(0, i + 1);
                            currentParent = part.id;
                            currentPage = 1;
                            load();
                        }
                    }}
                        onkeydown={(e) => {
                        if ((e.key === 'Enter' || e.key === ' ') && i < path.length - 1) {
                            e.preventDefault();
                            path = path.slice(0, i + 1);
                            currentParent = part.id;
                            currentPage = 1;
                            load();
                        }
                    }}
                >
                    {part.name}
                </button>
                {#if i < path.length - 1}
                    <span class="text-text-secondary flex-shrink-0">/</span>
                {/if}
            {/each}
        </div>
    </div>

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <h2 class="text-base sm:text-lg font-semibold text-text whitespace-nowrap">
            {items.length} {items.length === 1 ? t('itemOne') : (items.length >= 5 ? t('items') : t('item'))}
        </h2>

        <div class="flex items-center flex-wrap gap-1 sm:gap-2 text-secondary">
            <div class="text-xs sm:text-sm mr-1">{t(sortBy)}:</div>
            <div class="flex gap-1">
                <button
                        class="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1 rounded-lg transition-colors whitespace-nowrap"
                        class:font-medium={sortBy === 'name'}
                        style="background: {sortBy === 'name' ? 'var(--color-primary)' : 'var(--color-surface)'}; color: {sortBy === 'name' ? 'white' : 'var(--color-text)'};"
                        onclick={() => handleSort('name')}
                        type="button"
                >
                    {t('name')} {sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </button>
                <button
                        class="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1 rounded-lg transition-colors whitespace-nowrap"
                        class:font-medium={sortBy === 'modified'}
                        style="background: {sortBy === 'modified' ? 'var(--color-primary)' : 'var(--color-surface)'}; color: {sortBy === 'modified' ? 'white' : 'var(--color-text)'};"
                        onclick={() => handleSort('modified')}
                        type="button"
                >
                    {t('date')} {sortBy === 'modified' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </button>
                <button
                        class="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1 rounded-lg transition-colors whitespace-nowrap"
                        class:font-medium={sortBy === 'size'}
                        style="background: {sortBy === 'size' ? 'var(--color-primary)' : 'var(--color-surface)'}; color: {sortBy === 'size' ? 'white' : 'var(--color-text)'};"
                        onclick={() => handleSort('size')}
                        type="button"
                >
                    {t('size')} {sortBy === 'size' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </button>
            </div>
        </div>
    </div>

    <div class="flex-1 min-h-0 rounded-lg sm:rounded-xl overflow-hidden flex flex-col bg-card">
        <div class="hidden sm:grid sm:grid-cols-12 gap-3 md:gap-4 p-3 md:p-4 bg-surface border-b border-border-light">
            <div class="sm:col-span-6 md:col-span-6 font-medium text-sm text-secondary">{t('name')}</div>
            <div class="sm:col-span-3 md:col-span-3 font-medium text-sm text-secondary">{t('size')}</div>
            <div class="sm:col-span-3 md:col-span-3 font-medium text-sm text-secondary">{t('modified')}</div>
        </div>

        <div class="sm:hidden p-3 border-b border-border-light bg-surface">
            <div class="font-medium text-sm text-secondary">{t('items')}: {items.length}</div>
        </div>

        <div class="flex-1 overflow-y-auto" role="listbox" aria-label="File list">
            {#if paginatedItems().length === 0}
                <div class="p-6 sm:p-8 text-center" style="color: var(--color-text-secondary);">
                    {t('noFiles')}
                </div>
            {/if}

            {#each paginatedItems() as item (item.id)}
                {#if !isMobile}
                    <div
                            draggable="true"
                            ondragstart={() => draggingId = item.id}
                            ondragend={() => draggingId = null}
                            ondragover={(e) => item.type === 'dir' && e.preventDefault()}
                            class:ring-2={draggingId !== null && item.type === 'dir'}
                            ondrop={async (e) => {
                            if (item.type !== 'dir') return;
                            e.preventDefault();
                            if (!draggingId || draggingId === item.id) return;
                            await api.moveFile(draggingId, item.id);
                            draggingId = null;
                            await load();
                        }}
                            class="hidden sm:grid sm:grid-cols-12 gap-3 md:gap-4 p-3 md:p-4 border-b border-border-light hover:bg-card-hover transition-colors duration-150 cursor-pointer"
                            onclick={() => open(item)}
                            oncontextmenu={(e) => handleContextMenu(e, item)}
                            onkeydown={(e) => handleFileKeydown(e, item)}
                            role="option"
                            tabindex="0"
                            aria-selected={selectedFileId === item.id ? 'true' : 'false'}
                            aria-label="{item.name}, {item.type === 'dir' ? 'Folder' : 'File'}"
                    >
                        <div class="sm:col-span-6 md:col-span-6 flex items-center space-x-3">
                            <span class="text-xl">{getFileIcon(item.type, item.mime)}</span>
                            <div class="min-w-0">
                                <div class="font-medium text-sm md:text-base truncate" style="color: var(--color-text);">{item.name}</div>
                                <div class="text-xs" style="color: var(--color-text-secondary);">
                                    {item.type === 'dir' ? t('dir') : (item.mime || t('file'))}
                                </div>
                            </div>
                        </div>
                        <div class="sm:col-span-3 md:col-span-3 flex items-center text-xs md:text-sm text-secondary truncate">
                            {item.type === 'file' ? humanSize(item.size) : ''}
                        </div>
                        <div class="sm:col-span-3 md:col-span-3 flex items-center text-xs md:text-sm text-secondary truncate">
                            {fmtDate(item.modified)}
                        </div>
                    </div>
                {:else}
                    <div
                            draggable="true"
                            ondragstart={() => draggingId = item.id}
                            ondragend={() => draggingId = null}
                            ondragover={(e) => item.type === 'dir' && e.preventDefault()}
                            class:ring-2={draggingId !== null && item.type === 'dir'}
                            ondrop={async (e) => {
                            if (item.type !== 'dir') return;
                            e.preventDefault();
                            if (!draggingId || draggingId === item.id) return;
                            await api.moveFile(draggingId, item.id);
                            draggingId = null;
                            await load();
                        }}
                            class="sm:hidden p-3 border-b border-border-light hover:bg-card-hover transition-colors duration-150 cursor-pointer"
                            onclick={() => open(item)}
                            oncontextmenu={(e) => handleContextMenu(e, item)}
                            onkeydown={(e) => handleFileKeydown(e, item)}
                            role="option"
                            tabindex="0"
                            aria-selected={selectedFileId === item.id ? 'true' : 'false'}
                            aria-label="{item.name}, {item.type === 'dir' ? 'Folder' : 'File'}"
                    >
                        <div class="flex items-start space-x-3">
                            <span class="text-2xl mt-1 flex-shrink-0">{getFileIcon(item.type, item.mime)}</span>
                            <div class="flex-1 min-w-0">
                                <div class="flex justify-between items-start">
                                    <div class="min-w-0">
                                        <div class="font-medium text-base truncate" style="color: var(--color-text);">
                                            {item.name}
                                        </div>
                                        <div class="text-xs mt-1" style="color: var(--color-text-secondary);">
                                            {item.type === 'dir' ? t('dir') : (item.mime || t('file'))}
                                            {#if item.type === 'file' && item.size}
                                                • {humanSize(item.size)}
                                            {/if}
                                        </div>
                                    </div>
                                </div>
                                <div class="text-xs mt-2" style="color: var(--color-text-secondary);">
                                    {fmtDate(item.modified)}
                                </div>
                            </div>
                        </div>
                    </div>
                {/if}
            {/each}
        </div>

        <div class="p-3 sm:p-4 border-t border-border-light flex color-surface items-center justify-between" style="flex-shrink: 0;">
            <div class="text-xs sm:text-sm" style="color: var(--color-text-secondary);">
                {t('page')} {currentPage} {t('of')} {totalPages()}
            </div>
            <div class="flex items-center space-x-1 sm:space-x-2">
                <button
                        class="px-2 py-1 sm:px-3 sm:py-1 rounded-lg text-xs sm:text-sm bg-surface text-text transition-colors disabled:opacity-50 min-w-[60px]"
                        style="border: 1px solid var(--color-border);"
                        onclick={prevPage}
                        disabled={currentPage === 1}
                        type="button"
                >
                    {t('back')}
                </button>
                <div class="flex items-center space-x-1">
                    {#each pageNumbers() as page}
                        <button
                                class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs sm:text-sm transition-colors flex items-center justify-center"
                                style="background: {currentPage === page ? 'var(--color-primary)' : 'var(--color-surface)'}; color: {currentPage === page ? 'white' : 'var(--color-text)'}; border: 1px solid var(--color-border); min-width: 28px;"
                                onclick={() => goToPage(page)}
                                type="button"
                        >
                            {page}
                        </button>
                    {/each}
                </div>
                <button
                        class="px-2 py-1 sm:px-3 sm:py-1 rounded-lg text-xs sm:text-sm bg-surface color-text transition-colors disabled:opacity-50 min-w-[60px]"
                        style="border: 1px solid var(--color-border);"
                        onclick={nextPage}
                        disabled={currentPage === totalPages()}
                        type="button"
                >
                    {t('forward')}
                </button>
            </div>
        </div>
    </div>
</div>

{#if showEditor && editing}
    <EditorModal
            file={editing}
            close={() => { showEditor = false; editing = null; load(); }}
    />
{/if}

{#if contextMenu}
    <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={closeContextMenu}
            items={[
            { label: t('open'), action: handleOpen },
            { label: t('download'), action: handleDownload },
            { label: t('rename'), action: handleRename },
            { label: t('delete'), action: handleDelete },
        ]}
    />
{/if}

{#if renaming}
    <RenameModal
            item={renaming}
            existing={items}
            onClose={() => { renaming = null; load(); }}
    />
{/if}

{#if showCreate}
    <CreateItemModal
            parent={currentParent}
            existing={items}
            onClose={() => { showCreate = false; load(); }}
    />
{/if}

<style>
    @media (max-width: 768px) {
        .grid-cols-12 {
            gap: 12px !important;
        }

        .p-3 {
            padding: 12px !important;
        }

        .space-y-3 > * + * {
            margin-top: 12px !important;
        }
    }

    @media (max-width: 640px) {
        .p-3 {
            padding: 10px !important;
        }

        .text-base {
            font-size: 0.9375rem !important;
        }

        .text-sm {
            font-size: 0.8125rem !important;
        }

        .text-xs {
            font-size: 0.75rem !important;
        }
    }
</style>

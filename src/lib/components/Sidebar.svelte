<script lang="ts">
    import { goto } from '$app/navigation';
    import { t } from '$lib/i18n';
    import { token } from '$lib/stores.svelte';
    import ContextMenu from './ContextMenu.svelte';

    let collapsed = $state(false);
    let showUserMenu = $state(false);
    let userMenuPosition = $state({ x: 0, y: 0 });

    function toggle() { collapsed = !collapsed; }

    function openUserMenu(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        userMenuPosition = { x: rect.left, y: rect.top - 8 };
        showUserMenu = true;
    }

    function closeUserMenu() { showUserMenu = false; }

    function handleLogout() {
        token.value = '';
        goto('/login');
        closeUserMenu();
    }

    function openCreateMenu(e: MouseEvent) {
        window.dispatchEvent(new CustomEvent('ui:create'));
    }
</script>

<div
        class="h-screen transition-all duration-300 bg-card flex flex-col border-r border-border"
        class:collapsed
        class:w-16={collapsed}
        class:w-64={!collapsed}
>
    <div class="p-4 h-20 flex items-center justify-between border-b border-border-light">
        {#if !collapsed}
            <div class="font-bold text-primary text-lg">Cloud Storage</div>
        {/if}
        <button
                class="p-2 rounded-lg hover:bg-card-hover transition-colors duration-200"
                onclick={toggle}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                type="button"
        >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: var(--color-icon);">
                {#if collapsed}
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M4 6h16M4 12h16M4 18h16" />
                {:else}
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M6 18L18 6M6 6l12 12" />
                {/if}
            </svg>
        </button>
    </div>

    <div class="flex-1 p-4 space-y-2">
        <button
                class="w-full flex items-center bg-primary text-white justify-center p-3 rounded-xl transition-all duration-200 hover:scale-105"
                onclick={openCreateMenu}
                title={collapsed ? t('newFile') : ''}
                type="button"
        >
            {#if collapsed}
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 4v16m8-8H4" />
                </svg>
            {:else}
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>{t('newFile')}</span>
            {/if}
        </button>

        <nav class="space-y-1">
            <a href="/dashboard" class="flex items-center p-3 rounded-lg hover:bg-card-hover transition-colors duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: var(--color-icon);">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                {#if !collapsed}<span class="ml-3">{t('myFiles')}</span>{/if}
            </a>
        </nav>
    </div>

    <div class="p-4 border-t border-border-light">
        <button
                class="flex items-center w-full p-2 rounded-lg hover:bg-card-hover transition-colors duration-200 cursor-pointer"
                onclick={openUserMenu}
                oncontextmenu={(e) => { e.preventDefault(); openUserMenu(e); }}
                type="button"
                aria-haspopup="true"
                aria-expanded={showUserMenu}
        >
            <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center" >
                U
            </div>
            {#if !collapsed}
                <div class="ml-3 flex-1 text-left">
                    <div class="font-medium" style="color: var(--color-text);">User Name</div>
                    <div class="text-sm" style="color: var(--color-text-secondary);">user@example.com</div>
                </div>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: var(--color-icon);">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M19 9l-7 7-7-7" />
                </svg>
            {/if}
        </button>
    </div>
</div>

{#if showUserMenu}
    <ContextMenu
            x={userMenuPosition.x}
            y={userMenuPosition.y}
            onClose={closeUserMenu}
            items={[
            { label: t('logout'), action: handleLogout }
        ]}
    />
{/if}

<style>
    .collapsed { width: 72px; }
</style>


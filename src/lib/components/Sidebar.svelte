<script lang="ts">
    import { goto } from '$app/navigation';
    import { t } from '$lib/i18n';
    import { token } from '$lib/stores.svelte';
    import ContextMenu from './ContextMenu.svelte';

    let {
        collapsed = $bindable(false),
        onClose = () => {},
        isMobile = false
    } = $props();

    let showUserMenu = $state(false);
    let userMenuPosition = $state({ x: 0, y: 0 });

    function toggle() {
        if (isMobile) {
            onClose();
        } else {
            collapsed = !collapsed;
        }
    }

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
        if (isMobile) onClose();
    }

    function openCreateMenu(e: MouseEvent) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('ui:create'));
        if (isMobile) onClose();
    }

    function handleItemClick() {
        if (isMobile) {
            onClose();
        }
    }
</script>

<div
        class="h-screen transition-all duration-300 bg-card flex flex-col border-r border-border"
        class:w-16={collapsed && !isMobile}
        class:w-64={(!collapsed && !isMobile) || isMobile}
        style="width: {isMobile ? '100%' : collapsed ? '4rem' : '16rem'};"
>
    <div class="p-4 h-16 sm:h-20 flex items-center justify-between border-b border-border-light">
        {#if (!collapsed && !isMobile) || isMobile}
            <div class="font-bold text-primary text-base sm:text-lg truncate">Cloud Storage</div>
        {/if}

        <div class="flex items-center gap-2">
            {#if isMobile}
                <button
                        class="p-2 rounded-lg hover:bg-card-hover transition-colors duration-200"
                        onclick={() => onClose()}
                        aria-label="Close sidebar"
                        type="button"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: var(--color-icon);">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            {:else}
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
            {/if}
        </div>
    </div>

    <div class="flex-1 p-3 sm:p-4 space-y-2 overflow-y-auto">
        <button
                class="w-full flex items-center bg-primary text-white justify-center p-3 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                onclick={openCreateMenu}
                title={collapsed && !isMobile ? t('newFile') : ''}
                type="button"
        >
            {#if (collapsed && !isMobile)}
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 4v16m8-8H4" />
                </svg>
            {:else}
                <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 4v16m8-8H4" />
                </svg>
                <span class="text-sm sm:text-base truncate">{t('newFile')}</span>
            {/if}
        </button>

        <nav class="space-y-1">
            <a
                    href="/dashboard"
                    class="flex items-center p-2 sm:p-3 rounded-lg hover:bg-card-hover transition-colors duration-200 text-sm sm:text-base"
                    onclick={handleItemClick}
            >
                <svg class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: var(--color-icon);">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                {#if (!collapsed && !isMobile) || isMobile}
                    <span class="ml-3 truncate">{t('myFiles')}</span>
                {/if}
            </a>
        </nav>
    </div>

    <div class="p-3 sm:p-4 border-t border-border-light">
        <button
                class="flex items-center w-full p-2 rounded-lg hover:bg-card-hover transition-colors duration-200 cursor-pointer"
                onclick={openUserMenu}
                oncontextmenu={(e) => { e.preventDefault(); openUserMenu(e); }}
                type="button"
                aria-haspopup="true"
                aria-expanded={showUserMenu}
        >
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm sm:text-base flex-shrink-0">
                U
            </div>
            {#if (!collapsed && !isMobile) || isMobile}
                <div class="ml-3 flex-1 min-w-0 text-left">
                    <div class="font-medium text-sm sm:text-base truncate" style="color: var(--color-text);">
                        User Name
                    </div>
                    <div class="text-xs sm:text-sm truncate" style="color: var(--color-text-secondary);">
                        user@example.com
                    </div>
                </div>
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: var(--color-icon);">
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
    @media (max-width: 768px) {
        div[class*="h-screen"] {
            width: 100% !important;
            max-width: 280px;
        }
    }

    @media (max-width: 640px) {
        svg {
            width: 1rem !important;
            height: 1rem !important;
        }

        .text-sm {
            font-size: 0.875rem !important;
        }

        .text-xs {
            font-size: 0.75rem !important;
        }
    }
</style>


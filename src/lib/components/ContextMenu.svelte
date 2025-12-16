<script lang="ts">
    import { onMount } from 'svelte';

    export interface MenuItem {
        label: string;
        icon?: string;
        action: () => void;
    }

    interface Props {
        x: number;
        y: number;
        items: MenuItem[];
        onClose: () => void;
    }

    let { x, y, items, onClose }: Props = $props();
    let menuEl: HTMLDivElement | null = null;

    function handleAction(action: () => void) {
        action();
        onClose();
    }

    function handleKey(e: KeyboardEvent) {
        if (e.key === 'Escape') onClose();
    }

    onMount(() => {
        menuEl?.focus();
    });

    let left = $state(0), top = $state(0);
    onMount(() => {
        left = Math.min(x, (window?.innerWidth ?? 800) - 200);
        top = Math.min(y, (window?.innerHeight ?? 600) - 300);
    });
</script>

<button
        type="button"
        class="fixed inset-0 z-40"
        aria-label="Close menu"
        onclick={onClose}
></button>

<div
        bind:this={menuEl}
        class="fixed z-50 rounded-lg shadow-lg bg-card p-1 min-w-[140px] sm:min-w-[160px] outline-none
           max-w-[90vw] sm:max-w-none"
        style="left: {left}px; top: {top}px;"
        role="menu"
        tabindex="0"
        onkeydown={handleKey}
>
    {#each items as item}
        <button
                type="button"
                class="w-full text-left px-3 py-2 rounded hover:bg flex gap-2"
                role="menuitem"
                onclick={() => handleAction(item.action)}
        >
            {#if item.icon}
                <span>{item.icon}</span>
            {/if}
            <span>{item.label}</span>
        </button>
    {/each}
</div>



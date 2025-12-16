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
</script>

<button
        type="button"
        class="fixed inset-0 z-40"
        aria-label="Close menu"
        onclick={onClose}
></button>

<div
        bind:this={menuEl}
        class="fixed z-50 rounded-lg shadow-lg bg-card p-1 min-w-[160px] outline-none"
        style="left: {x}px; top: {y}px;"
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



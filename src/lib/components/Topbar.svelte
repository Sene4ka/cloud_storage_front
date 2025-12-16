<script lang="ts">
    import { theme, lang } from '$lib/stores.svelte';
    import { t } from '$lib/i18n';
    import { searchQuery } from '$lib/search.svelte';

    let {
        isMobile = false,
        onMenuToggle = () => {}
    } = $props();

    let isDark = $state(theme.value === 'dark');

    $effect(() => {
        isDark = theme.value === 'dark';
    });

    function handleThemeChange(e: Event) {
        const target = e.target as HTMLInputElement;
        isDark = target.checked;
        theme.value = isDark ? 'dark' : 'light';
    }

    function handleLangToggle(): void {
        lang.value = lang.value === 'ru' ? 'en' : 'ru';
    }

    function handleSearch(): void {
        if ($searchQuery.trim()) {
            console.log('Searching for:', $searchQuery);
        }
    }

    function clearSearch(): void {
        $searchQuery = '';
    }
</script>

<nav class="sticky top-0 z-10 bg-card border-b border-border-light">
    <div class="h-16 sm:h-20 px-3 sm:px-4 md:px-5">
        <div class="flex items-center justify-between gap-3 h-full">
            {#if isMobile}
                <button
                        class="p-2 rounded-lg hover:bg-card-hover transition-colors md:hidden flex-shrink-0"
                        onclick={() => onMenuToggle()}
                        type="button"
                        aria-label="Open menu"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            {/if}

            <div class="flex-1 min-w-0 max-w-2xl">
                <div class="relative w-full">
                    <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24"
                         style="color: var(--color-icon);">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                            type="search"
                            bind:value={$searchQuery}
                            onkeydown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder={t("search")}
                            class="w-full pl-9 pr-8 sm:pl-10 sm:pr-10 py-2 rounded-lg sm:rounded-xl bg-surface text-text transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                            style="border: 1px solid var(--color-border-light); min-height: 40px;"
                            aria-label="Search files and folders"
                    />
                    {#if $searchQuery}
                        <button
                                class="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-card-hover transition-colors"
                                onclick={clearSearch}
                                type="button"
                                aria-label="Clear search"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    {/if}
                </div>
            </div>

            <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <button
                        class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-surface flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-md"
                        style="border: 1px solid var(--color-border); min-width: 32px; min-height: 32px;"
                        onclick={handleLangToggle}
                        title="Switch language"
                        type="button"
                >
                    <span class="font-medium text-xs sm:text-sm">{lang.value.toUpperCase()}</span>
                </button>

                <label class="relative inline-flex items-center cursor-pointer">
                    <input
                            type="checkbox"
                            class="sr-only"
                            checked={isDark}
                            oninput={handleThemeChange}
                    />
                    <div class="w-12 h-6 sm:w-14 sm:h-7 rounded-full bg-surface transition-colors duration-300 relative"
                         style="border: 1px solid var(--color-border);">
                        <div class="absolute top-0.5 left-0.5 w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full transition-transform duration-300"
                             class:translate-x-6={isDark}>
                            {#if !isDark}
                                <svg class="w-3 h-3 sm:w-4 sm:h-4 m-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            {:else}
                                <svg class="w-3 h-3 sm:w-4 sm:h-4 m-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            {/if}
                        </div>
                    </div>
                </label>
            </div>
        </div>
    </div>
</nav>

<style>
    @media (max-width: 640px) {
        .min-h-\[40px\] {
            min-height: 36px !important;
        }
    }
</style>

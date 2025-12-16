<script lang="ts">
    import { theme, lang } from '$lib/stores.svelte';
    import { t } from '$lib/i18n';
    import { searchQuery } from '$lib/search.svelte';

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

<nav class="sticky top-0 h-20 z-10 p-5 bg-card border-b border-border-light">
    <div class="flex items-center justify-between gap-4">
        <div class="flex-1 min-w-0">
            <div class="relative max-w-2xl">
                <svg class="absolute color-icon left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                        type="search"
                        bind:value={$searchQuery}
                        onkeydown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder={t("search")}
                        class="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface text-text transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
                        style="border: 1px solid var(--color-border-light);"
                        aria-label="Search files and folders"
                />
                {#if $searchQuery}
                    <button
                            class="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-card-hover transition-colors"
                            onclick={clearSearch}
                            type="button"
                            aria-label="Clear search"
                    >
                    </button>
                {/if}
            </div>
        </div>

        <div class="flex items-center gap-3 flex-shrink-0">
            <button
                    class="w-10 h-10 rounded-full bg-surface color-text flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-md"
                    style="border: 1px solid var(--color-border);"
                    onclick={handleLangToggle}
                    title="Switch language"
                    type="button"
            >
                <span class="font-medium text-sm">{lang.value.toUpperCase()}</span>
            </button>

            <label class="relative inline-flex items-center cursor-pointer">
                <input
                        type="checkbox"
                        class="sr-only"
                        checked={isDark}
                        oninput={handleThemeChange}
                />
                <div class="w-14 h-7 rounded-full bg-surface transition-colors duration-300 relative"
                     style="border: 1px solid var(--color-border);">
                    <div class="absolute top-0.5 left-0.5 w-6 h-6 bg-primary rounded-full transition-transform duration-300"
                         class:translate-x-7={isDark}>
                        {#if !isDark}
                            <svg class="w-4 h-4 m-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        {:else}
                            <svg class="w-4 h-4 m-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        {/if}
                    </div>
                </div>
            </label>
        </div>
    </div>
</nav>

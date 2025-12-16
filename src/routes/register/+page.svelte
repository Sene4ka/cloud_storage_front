<script lang="ts">
    import { goto } from '$app/navigation';
    import { t } from '$lib/i18n';
    import * as api from '$lib/api';
    import { token, isAuthenticated } from '$lib/stores.svelte';

    let email = $state('');
    let name = $state('');
    let password = $state('');
    let error = $state('');
    let loading = $state(false);

    $effect(() => {
        if (isAuthenticated()) {
            goto('/dashboard');
        }
    });

    async function handleSubmit(event: Event) {
        event.preventDefault();
        error = '';
        loading = true;

        try {
            const response = await api.register(email, name, password);
            token.value = response.token;
            await goto('/dashboard');
        } catch (err) {
            error = err instanceof Error ? err.message : 'Registration failed';
        } finally {
            loading = false;
        }
    }
</script>

<div class="flex items-center justify-center min-h-screen">
    <div class="w-full max-w-md p-6 bg-card rounded-xl shadow-lg">
        <h1 class="text-2xl font-bold mb-6 text-center text-text">
            {t('register')}
        </h1>

        {#if error}
            <div class="mb-4 p-3 bg-card text-error rounded">
                {error}
            </div>
        {/if}

        <form onsubmit={handleSubmit} class="space-y-4">
            <div>
                <label for="email" class="block mb-2 text-sm font-medium text-text">
                    {t('email')}
                </label>
                <input
                        id="email"
                        type="email"
                        bind:value={email}
                        required
                        class="w-full p-2 border rounded bg-surface text-text"
                />
            </div>

            <div>
                <label for="password" class="block mb-2 text-sm font-medium text-text">
                    {t('password')}
                </label>
                <input
                        id="password"
                        type="password"
                        bind:value={password}
                        required
                        class="w-full p-2 border rounded bg-surface text-text"
                />
            </div>

            <button
                    type="submit"
                    disabled={loading}
                    class="w-full py-2 px-4 bg-primary text-text rounded transition-colors"
            >
                {loading ? t('loading') : t('registerBtn')}
            </button>
        </form>

        <div class="mt-4 text-center">
            <a href="/login" class="text-sm text-primary hover:underline">
                {t('alreadyHaveAccount')}
            </a>
        </div>
    </div>
</div>
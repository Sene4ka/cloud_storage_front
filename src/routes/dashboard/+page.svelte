<script lang="ts">
    import { goto } from '$app/navigation';
    import { isAuthenticated } from '$lib/stores.svelte';
    import Sidebar from '$lib/components/Sidebar.svelte';
    import Topbar from '$lib/components/Topbar.svelte';
    import FileList from '$lib/components/FileList.svelte';

    $effect(() => {
        if (!isAuthenticated()) {
            goto('/login');
        }
    });
</script>

{#if isAuthenticated()}
    <div class="flex min-h-screen bg-bg">
        <Sidebar />

        <div class="flex flex-1 flex-col min-h-0">
            <Topbar />

            <main class="flex-1 p-6 min-h-0">
                <div class="h-full pb-6">
                    <div class="bg-card rounded-xl shadow-md h-full overflow-hidden">
                        <FileList />
                    </div>
                </div>
            </main>
        </div>
    </div>
{:else}
    <div class="flex items-center justify-center min-h-screen">
        <div class="text-gray-600">Redirecting to login...</div>
    </div>
{/if}
<script lang="ts">
    import { goto } from '$app/navigation';
    import { isAuthenticated } from '$lib/stores.svelte';
    import Sidebar from '$lib/components/Sidebar.svelte';
    import Topbar from '$lib/components/Topbar.svelte';
    import FileList from '$lib/components/FileList.svelte';
    import { onMount } from 'svelte';

    let sidebarOpen = $state(false);
    let isMobile = $state(false);

    let collapsed = $state(false);

    $effect(() => {
        if (!isAuthenticated()) {
            goto('/login');
        }
    });

    onMount(() => {
        const checkMobile = () => {
            isMobile = window.innerWidth < 768;
            if (!isMobile && sidebarOpen) sidebarOpen = false;
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    });

    function toggleSidebar() {
        sidebarOpen = !sidebarOpen;
    }

    function closeSidebar() {
        sidebarOpen = false;
    }
</script>

{#if isAuthenticated()}
    <div class="flex min-h-screen bg-bg">
        <div class="hidden md:block">
            <Sidebar bind:collapsed onClose={closeSidebar} />
        </div>

        {#if sidebarOpen && isMobile}
            <div class="fixed inset-0 z-50 md:hidden">
                <div class="absolute inset-0 bg-black/50" onclick={closeSidebar}/>
                <div class="absolute left-0 top-0 bottom-0 w-64 bg-card">
                    <Sidebar bind:collapsed onClose={closeSidebar} isMobile />
                </div>
            </div>
        {/if}

        <div class="flex flex-1 flex-col min-h-0 w-full">
            <Topbar onMenuToggle={toggleSidebar} {isMobile} />

            <main class="flex-1 p-3 sm:p-4 md:p-6 min-h-0">
                <div class="h-full pb-3 sm:pb-4 md:pb-6">
                    <div class="bg-card rounded-lg sm:rounded-xl shadow-md h-full overflow-hidden">
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

<style>
    @media (max-width: 768px) {
        main {
            padding-left: 12px !important;
            padding-right: 12px !important;
        }
    }
</style>
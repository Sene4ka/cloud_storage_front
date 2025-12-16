<script lang="ts">
    import { goto } from '$app/navigation';

    $effect(() => {
        goto('/login');
    });
</script>

<div class="flex items-center justify-center min-h-screen">
    <div class="text-gray-600">Loading...</div>
</div>

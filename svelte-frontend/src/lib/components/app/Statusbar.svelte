<script module lang="ts">
declare const __BUILD_TIME__: string;
declare const __APP_VERSION__: string;
</script>

<script lang="ts">
import { onMount } from 'svelte';
import { setupConnectivity, isOnline } from '$lib/utils/connectivity';

onMount(() => {
    const connectivityCleanup = setupConnectivity();

    return () => {
        connectivityCleanup();
    };
});
</script>

<div
    class="h-8 border-t px-4 flex items-center justify-between text-sm text-muted-foreground"
>
    <span>
        Python server:
        {$isOnline ? 'Online' : 'Offline'}
    </span>

    <span>
        v{__APP_VERSION__}
        | Build {__BUILD_TIME__}
    </span>
</div>

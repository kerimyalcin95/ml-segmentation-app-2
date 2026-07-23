<script lang="ts">
import { isOnline } from '$lib/utils/connectivity';

export let appVersion: string;
export let buildTime: string;
</script>

<div
    class="h-8 border-t px-4 flex items-center justify-between text-sm text-muted-foreground"
>
    <span>
        Python server:
        {$isOnline ? 'Online' : 'Offline'}
    </span>

    <span>
        v{appVersion}
        | Build {buildTime}
    </span>
</div>
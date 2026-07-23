<script lang="ts">
import { isOnline } from '$lib/utils/connectivity';

interface Props {
    readonly appVersion: string;
    readonly buildTime: string;
}

let { appVersion, buildTime } = $props<Props>();
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

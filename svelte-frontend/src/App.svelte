<script lang="ts">
import { onMount } from 'svelte';

import { darkThemeSetup } from '$lib/utils/darkTheme';

import { Separator } from '$lib/components/ui/separator';
import { CanvasManager } from '$lib/canvas/canvas';
import Sidebar from '$lib/app/Sidebar.svelte';
import Statusbar from '$lib/app/Statusbar.svelte';
import CanvasView from '$lib/app/CanvasView.svelte';
import type { Mode } from '$lib/types/mode';

let canvas = $state<CanvasManager | undefined>(undefined);
let mode = $state<Mode>('editing');

onMount(() => {
    const darkThemeCleanup = darkThemeSetup();

    return () => {
        darkThemeCleanup();
    };
});
</script>

<div class="h-screen flex flex-col">
    <!-- Workspace -->
    <div class="flex-1 flex overflow-hidden">
        <Sidebar {mode} {canvas} />
        <Separator orientation="vertical" />
        <CanvasView
            {mode}
            onCanvasReady={(canvasManager) => (canvas = canvasManager)}
        />
    </div>

    <Statusbar />
</div>

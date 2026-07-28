<script lang="ts">
import { onMount } from 'svelte';

import { darkThemeSetup } from '$lib/utils/darkTheme';

import { Separator } from '$lib/components/ui/separator';
import { CanvasManager } from '$lib/canvas/canvas';
import Sidebar from '$lib/components/app/sidebar/Sidebar.svelte';
import Statusbar from '$lib/components/app/Statusbar.svelte';
import CanvasView from '$lib/components/app/CanvasView.svelte';
import type { Mode } from '$lib/types/mode';

let canvas = $state<CanvasManager>();
let mode = $state<Mode>('editing');

$effect(() => {
    document.documentElement.dataset.mode = mode;
});

onMount(() => {
    const darkThemeCleanup = darkThemeSetup();

    return () => {
        darkThemeCleanup();
    };
});
</script>

<div data-e2e="app" class="h-screen flex flex-col">
    <!-- Workspace -->
    <div class="flex-1 flex overflow-hidden min-h-0 min-w-0">
        {#if canvas}
            <Sidebar {mode} {canvas} />
        {/if}
        <Separator orientation="vertical" />
        <CanvasView
            bind:mode
            onCanvasReady={(canvasManager: CanvasManager) => (canvas = canvasManager)}
        />
    </div>

    <Statusbar />
</div>

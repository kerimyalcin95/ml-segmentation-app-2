<script lang="ts">
import { onMount } from 'svelte';

import { darkThemeSetup } from '$lib/utils/darkTheme';

import { Separator } from '$lib/components/ui/separator';
import { CanvasManager } from '$lib/canvas/canvas';
import Sidebar from '$lib/components/app/sidebar/Sidebar.svelte';
import Statusbar from '$lib/components/app/Statusbar.svelte';
import WorkspaceView from '$lib/components/app/WorkspaceView.svelte';
import type { Mode } from '$lib/types/mode';
import type { WorkspaceViewMode } from '$lib/types/workspace';

let canvas = $state<CanvasManager>();
let mode = $state<Mode>('editing');
let workspaceViewMode = $state<WorkspaceViewMode>('canvas');

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
        <WorkspaceView
            bind:mode
            bind:workspaceViewMode
            onCanvasReady={(canvasManager: CanvasManager) =>
                (canvas = canvasManager)}
        />
    </div>

    <Statusbar />
</div>

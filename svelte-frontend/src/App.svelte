<script lang="ts">
import { onMount } from 'svelte';

import { darkThemeSetup } from '$lib/utils/darkTheme';

import { Separator } from '$lib/components/ui/separator';
import { CanvasManager } from '$lib/canvas/canvas';
import Sidebar from '$lib/components/app/sidebar/Sidebar.svelte';
import Statusbar from '$lib/components/app/Statusbar.svelte';
import WorkspaceView from '$lib/components/app/WorkspaceView.svelte';
import type { WorkspaceViewMode } from '$lib/types/workspace';
import { sessionStore } from '$lib/components/stores/sessionStore.svelte';
import MessageDialog from '$lib/components/app/dialog/MessageDialog.svelte';
import * as localStorage from '$lib/utils/localStorage';

let canvas = $state<CanvasManager>();
let workspaceViewMode = $state<WorkspaceViewMode>('canvas');

let pythonError = $state('');
let pythonErrorOpen = $state(false);

$effect(() => {
    document.documentElement.dataset.mode = sessionStore.mode;
});

onMount(() => {
    const darkThemeCleanup = darkThemeSetup();

    void localStorage.load().then((session) => {
        if (session) {
            sessionStore.loadJSON(session);
        }
    });

    const unsubscribePythonError =
        window.electronAPI.subscribePythonServerErrors(
            (message: string) => {
                pythonError = message;
                pythonErrorOpen = true;
            },
        );

    return () => {
        darkThemeCleanup();
        unsubscribePythonError();
    };
});
</script>

<div data-e2e="app" class="h-screen flex flex-col">

    <!-- Workspace -->
    <div class="flex-1 flex overflow-hidden min-h-0 min-w-0">
        {#if canvas}
            <Sidebar {canvas} />
        {/if}

        <Separator orientation="vertical" />

        <WorkspaceView
            bind:workspaceViewMode
            onCanvasReady={(canvasManager: CanvasManager) =>
                (canvas = canvasManager)}
        />
    </div>

    <Statusbar />
</div>

<MessageDialog
    bind:open={pythonErrorOpen}
    title="Python 3.12 Required"
    message={pythonError}
/>
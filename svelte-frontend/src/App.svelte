<script lang="ts">
import { onMount } from 'svelte';

import { darkThemeSetup } from '$lib/utils/darkTheme';

import { Separator } from '$lib/components/ui/separator';
import { CanvasManager } from '$lib/canvas/canvas';
import Sidebar from '$lib/components/app/sidebar/Sidebar.svelte';
import Statusbar from '$lib/components/app/Statusbar.svelte';
import WorkspaceView from '$lib/components/app/WorkspaceView.svelte';
import { sessionStore } from '$lib/components/stores/sessionStore.svelte';
import MessageDialog from '$lib/components/app/dialog/MessageDialog.svelte';
import * as localStorage from '$lib/utils/localStorage';

let canvas = $state<CanvasManager>();

let pythonError = $state('');
let pythonErrorTitle = $state('Python Server Error');
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
        window.electronAPI.subscribePythonServerErrors((message: string) => {
            pythonError = message;

            if (message.includes('Python 3.12 is required')) {
                pythonErrorTitle = 'Python 3.12 Required';
            } else if (
                message.includes('Required Python packages are missing')
            ) {
                pythonErrorTitle = 'Python Dependencies Missing';
            } else if (
                message.includes('port') &&
                (message.includes('unavailable') ||
                    message.includes('already in use'))
            ) {
                pythonErrorTitle = 'Python Server Error';
            } else {
                pythonErrorTitle = 'Python Server Error';
            }

            pythonErrorOpen = true;
        });

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
            onCanvasReady={(canvasManager: CanvasManager) =>
                (canvas = canvasManager)}
        />
    </div>

    <Statusbar />
</div>

<MessageDialog
    bind:open={pythonErrorOpen}
    title={pythonErrorTitle}
    message={pythonError}
/>

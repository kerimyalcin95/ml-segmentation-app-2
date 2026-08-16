<script lang="ts">
import ModeSelector from '$lib/components/app/ModeSelector.svelte';
import WorkspaceToggle from '$lib/components/app/WorkspaceToggle.svelte';

import Canvas from '$lib/components/app/canvas/Canvas.svelte';
import Terminal from '$lib/components/app/Terminal.svelte';

import { CanvasManager } from '$lib/canvas/canvas';
import { sessionStore } from '../stores/sessionStore.svelte';

interface Props {
    onCanvasReady?: (canvas: CanvasManager) => void;
}

let {
    onCanvasReady
}: Props = $props();

</script>

<div
    data-e2e="workspace-view"
    class="flex-1 relative flex flex-col min-h-0 min-w-0"
>
    <ModeSelector />

    <WorkspaceToggle/>

    <div class="flex-1 relative min-h-0 min-w-0">
        <div
            class={[
                'absolute inset-0',
                sessionStore.viewMode === 'terminal'
                    ? 'opacity-0 pointer-events-none'
                    : 'opacity-100',
            ]}
        >
            <Canvas {onCanvasReady}/>
        </div>

        <div
            class={[
                'absolute inset-0 mx-6',
                sessionStore.viewMode === 'canvas'
                    ? 'opacity-0 pointer-events-none'
                    : 'opacity-100',
                ]}
        >
            <Terminal/>
        </div>
    </div>
</div>

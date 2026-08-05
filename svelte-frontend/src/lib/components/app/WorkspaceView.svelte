<script lang="ts">
import ModeSelector from '$lib/components/app/ModeSelector.svelte';
import WorkspaceToggle from '$lib/components/app/WorkspaceToggle.svelte';

import Canvas from '$lib/components/app/canvas/Canvas.svelte';
import Terminal from '$lib/components/app/Terminal.svelte';

import { CanvasManager } from '$lib/canvas/canvas';

import type { Mode } from '$lib/types/mode';
import type { WorkspaceViewMode } from '$lib/types/workspace';

interface Props {
    onCanvasReady?: (canvas: CanvasManager) => void;
    mode: Mode;
    workspaceViewMode: WorkspaceViewMode;
}

let {
    onCanvasReady,
    mode = $bindable(),
    workspaceViewMode = $bindable(),
}: Props = $props();

</script>

<div
    data-e2e="workspace-view"
    class="flex-1 relative flex flex-col min-h-0 min-w-0"
>
    <ModeSelector bind:mode />

    <WorkspaceToggle bind:workspaceViewMode />

    <div class="flex-1 relative min-h-0 min-w-0">
        <div
            class={[
                'absolute inset-0',
                workspaceViewMode === 'terminal'
                    ? 'opacity-0 pointer-events-none'
                    : 'opacity-100',
            ]}
        >
            <Canvas {onCanvasReady} />
        </div>

        <div
            class={[
                'absolute inset-0 mx-6',
                workspaceViewMode === 'canvas'
                    ? 'opacity-0 pointer-events-none'
                    : 'opacity-100',
            ]}
        >
            <Terminal/>
        </div>
    </div>
</div>

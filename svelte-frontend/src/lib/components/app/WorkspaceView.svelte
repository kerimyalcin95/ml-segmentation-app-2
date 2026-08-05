<script lang="ts">
import ModeSelector from '$lib/components/app/ModeSelector.svelte';
import Canvas from '$lib/components/app/canvas/Canvas.svelte';
import { CanvasManager } from '$lib/canvas/canvas';
import type { Mode } from '$lib/types/mode';
import type { WorkspaceViewMode } from '$lib/types/workspace';
import WorkspaceToggle from '$lib/components/app/WorkspaceToggle.svelte';

interface Props {
    onCanvasReady?: (canvas: CanvasManager) => void;
    mode: Mode;
    workspaceViewMode: WorkspaceViewMode;
}

let {
    onCanvasReady,
    mode = $bindable(),
    workspaceViewMode = $bindable()
}: Props = $props();

</script>

<div data-e2e="canvas-view" class="flex-1 relative flex flex-col min-h-0 min-w-0">

    <ModeSelector bind:mode />

    <WorkspaceToggle bind:workspaceViewMode />

    <Canvas
        {onCanvasReady}
    />

</div>
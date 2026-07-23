<script module lang="ts">
declare const __BUILD_TIME__: string;
declare const __APP_VERSION__: string;
</script>

<script lang="ts">
import { onMount } from 'svelte';

import { darkThemeSetup } from '$lib/utils/darkTheme';
import { setupConnectivity, isOnline } from '$lib/utils/connectivity';

import { Separator } from '$lib/components/ui/separator';
import * as ToggleGroup from '$lib/components/ui/toggle-group';

import { CanvasManager } from '$lib/canvas/canvas';
import Sidebar from '$lib/app/Sidebar.svelte';
import ModeSelector from '$lib/app/ModeSelector.svelte';
import Statusbar from '$lib/app/Statusbar.svelte';
import type { Mode } from '$lib/types/mode';

let viewport: HTMLDivElement;
let container: HTMLDivElement;

let canvas = $state<CanvasManager | undefined>(undefined);

let mode = $state<Mode>('editing');

onMount(() => {
    const darkThemeCleanup = darkThemeSetup();
    const connectivityCleanup = setupConnectivity();

    canvas = new CanvasManager(container, viewport);

    const resizeHandler = () => {
        canvas.resize(viewport);
    };

    window.addEventListener('resize', resizeHandler);

    return () => {
        darkThemeCleanup();
        connectivityCleanup();

        window.removeEventListener('resize', resizeHandler);

        canvas.destroy();
    };
});
</script>

<div class="h-screen flex flex-col">
    <!-- Workspace -->
    <div class="flex-1 flex overflow-hidden">
        <Sidebar
            {mode}
            {canvas}
        />

        <!-- Divider -->
        <Separator orientation="vertical" />

        <!-- Canvas -->
        <div bind:this={viewport} class="flex-1 relative overflow-auto">
            <!-- Floating mode selector -->
            <div class="absolute top-4 left-4 z-20">
                <ModeSelector bind:mode></ModeSelector>
            </div>

            <!-- Konva container -->
            <div bind:this={container} class="relative w-full h-full"></div>
        </div>
    </div>

    <Statusbar appVersion={__APP_VERSION__} buildTime={__BUILD_TIME__} />
</div>

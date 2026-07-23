<script module lang="ts">
declare const __BUILD_TIME__: string;
declare const __APP_VERSION__: string;
</script>

<script lang="ts">
import { onMount } from 'svelte';

import { darkThemeSetup } from '$lib/utils/darkTheme';
import { setupConnectivity, isOnline } from '$lib/utils/connectivity';

import { Button } from '$lib/components/ui/button';
import { Slider } from '$lib/components/ui/slider';
import { Separator } from '$lib/components/ui/separator';
import { Card } from '$lib/components/ui/card';
import * as ToggleGroup from '$lib/components/ui/toggle-group';

import { CanvasManager } from '$lib/canvas/canvas';

let viewport: HTMLDivElement;
let container: HTMLDivElement;

let canvas: CanvasManager;

type Mode = 'editing' | 'annotation' | 'training' | 'prediction';

let mode = $state<string>('editing');

let opacity = $state(50);
let threshold = $state(50);

async function loadImage() {
    const path = await window.electronAPI.openImage();

    if (!path) return;

    canvas.loadImage(path);
}

function setGrayscale() {
    canvas.setGrayscale(true);
}

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
        <!-- Sidebar -->
        <aside class="w-72 p-4">
            <Card class="h-full p-4 flex flex-col gap-4 overflow-auto">
                {#if mode === 'editing'}
                    <h2 class="text-sm font-semibold">Editing</h2>

                    <Button onclick={loadImage}>Load Image</Button>

                    <Button onclick={setGrayscale} variant="secondary"
                        >Grayscale</Button
                    >

                    <div class="space-y-2">
                        <span class="text-sm"> Threshold </span>

                        <Slider
                            type="single"
                            bind:value={threshold}
                            max={100}
                            step={1}
                        />
                    </div>

                    <div class="space-y-2">
                        <span class="text-sm"> Opacity </span>

                        <Slider
                            type="single"
                            bind:value={opacity}
                            max={100}
                            step={1}
                        />
                    </div>
                {:else if mode === 'annotation'}
                    <h2 class="text-sm font-semibold">Labeling</h2>

                    <Button>Add Label</Button>

                    <Button variant="secondary">Delete Label</Button>
                {:else if mode === 'training'}
                    <h2 class="text-sm font-semibold">Training</h2>

                    <Button>Start Training</Button>

                    <div class="text-sm text-muted-foreground">
                        Dataset configuration and training parameters.
                    </div>
                {:else if mode === 'prediction'}
                    <h2 class="text-sm font-semibold">Prediction</h2>

                    <Button>Run Prediction</Button>

                    <div class="text-sm text-muted-foreground">
                        Model output and prediction controls.
                    </div>
                {/if}
            </Card>
        </aside>

        <!-- Divider -->
        <Separator orientation="vertical" />

        <!-- Canvas -->
        <div bind:this={viewport} class="flex-1 relative overflow-auto">
            <!-- Floating mode selector -->
            <div class="absolute top-4 left-4 z-20">
                <Card class="p-1">
                    <ToggleGroup.Root type="single" bind:value={mode}>
                        <ToggleGroup.Item value="editing">
                            Editing
                        </ToggleGroup.Item>

                        <ToggleGroup.Item value="annotation">
                            Annotation
                        </ToggleGroup.Item>

                        <ToggleGroup.Item value="training">
                            Training
                        </ToggleGroup.Item>

                        <ToggleGroup.Item value="prediction">
                            Prediction
                        </ToggleGroup.Item>
                    </ToggleGroup.Root>
                </Card>
            </div>

            <!-- Konva container -->
            <div bind:this={container} class="relative w-full h-full"></div>
        </div>
    </div>

    <!-- Status bar -->
    <div
        class="h-8 border-t px-4 flex items-center justify-between text-sm text-muted-foreground"
    >
        <span>
            Python server:
            {$isOnline ? 'Online' : 'Offline'}
        </span>

        <span>
            v{__APP_VERSION__}
            | Build {__BUILD_TIME__}
        </span>
    </div>
</div>

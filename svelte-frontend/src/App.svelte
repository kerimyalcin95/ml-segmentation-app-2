<script context="module" lang="ts">
    declare const __BUILD_TIME__: string;
    declare const __APP_VERSION__: string;
</script>

<script lang="ts">
    import { darkThemeSetup } from '$lib/utils/darkTheme';
    import { setupConnectivity, isOnline } from '$lib/utils/connectivity';
    import { onMount } from 'svelte';

    import { Button } from '$lib/components/ui/button';
    import { Slider } from '$lib/components/ui/slider';
    import { Separator } from '$lib/components/ui/separator';
    import { Card } from '$lib/components/ui/card';

    import { CanvasManager } from '$lib/canvas/canvas';

    let viewport: HTMLDivElement;
    let container: HTMLDivElement;
    let canvas: CanvasManager;

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

        window.addEventListener('resize', () => {
            canvas.resize(viewport);
        });

        return () => {
            darkThemeCleanup();
            connectivityCleanup();

            canvas.destroy();
        };
    });
</script>

<div class="h-screen flex flex-col">
    <!-- Main workspace -->
    <div class="flex-1 flex overflow-hidden">
        <!-- Sidebar -->
        <aside class="w-72 p-4">
            <Card class="h-full p-4 flex flex-col gap-4">
                <Button onclick={loadImage}>Load Image</Button>

                <Button onclick={setGrayscale} variant="secondary">Grayscale</Button>

                <div class="space-y-2">
                    <span class="text-sm"> Threshold </span>

                    <Slider type="single" value={50} max={100} step={1} />
                </div>

                <div class="space-y-2">
                    <span class="text-sm"> Opacity</span>

                    <Slider type="single" value={80} max={100} step={1} />
                </div>
            </Card>
        </aside>

        <!-- Divider -->
        <Separator orientation="vertical" />

        <!-- Konva -->
        <div bind:this={viewport} class="flex-1 relative overflow-auto">
            <div bind:this={container} class="relative w-full h-full"></div>
        </div>
    </div>

    <!-- Status bar -->
    <div class="h-8 border-t px-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>
            Python server: {$isOnline ? 'Online' : 'Offline'}
        </span>

        <span>
            v{__APP_VERSION__} | Build {__BUILD_TIME__}
        </span>
    </div>
</div>

<script context="module" lang="ts">
    declare const __BUILD_TIME__: string;
</script>

<script lang="ts">
    import { darkThemeSetup } from '$lib/utils/darkTheme';
    import { setupConnectivity, isOnline } from '$lib/utils/connectivity';
    import { onMount } from 'svelte';

    import { Button } from '$lib/components/ui/button';
    import { Slider } from '$lib/components/ui/slider';
    import { Separator } from '$lib/components/ui/separator';
    import { Card } from '$lib/components/ui/card';

    import Konva from 'konva';

    const buildTime = __BUILD_TIME__;

    let container: HTMLDivElement;

    onMount(() => {
        const darkThemeCleanup = darkThemeSetup();
        const connectivityCleanup = setupConnectivity();

        const stage = new Konva.Stage({
            container: container,
            width: container.clientWidth,
            height: container.clientHeight,
        });

        const layer = new Konva.Layer();

        const rectangle = new Konva.Rect({
            x: 100,
            y: 100,
            width: 200,
            height: 100,
            fill: 'blue',
        });

        layer.add(rectangle);
        stage.add(layer);

        return () => {
            darkThemeCleanup();
            connectivityCleanup();
            stage.destroy();
        };
    });
</script>

<div class="h-screen flex flex-col">
    <!-- Main workspace -->
    <div class="flex-1 flex overflow-hidden">
        <!-- Sidebar -->
        <aside class="w-72 p-4">
            <Card class="h-full p-4 flex flex-col gap-4">
                <Button>Load Image</Button>

                <Button variant="secondary">Test</Button>

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
        <main class="flex-1 relative">
            <div bind:this={container} id="konva-container" class="absolute inset-0"></div>
        </main>
    </div>

    <!-- Status bar -->
    <div class="h-8 border-t px-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>
            Python server: {$isOnline ? 'Online' : 'Offline'}
        </span>

        <span>
            Build {buildTime}
        </span>
    </div>
</div>

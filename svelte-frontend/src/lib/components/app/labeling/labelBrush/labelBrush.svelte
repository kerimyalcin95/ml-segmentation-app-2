<script lang="ts">
import { Card } from '$lib/components/ui/card';
import { Slider } from '$lib/components/ui/slider';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';

import { CanvasManager } from "$lib/canvas/canvas";

interface Props {
    canvas: CanvasManager;
}

let { canvas }: Props = $props();

let brushSize = $state(32);

function handleSliderChange(value: number) {
    brushSize = value;
}

function handleInput(event: Event) {
    const value = Number((event.currentTarget as HTMLInputElement).value);

    brushSize = Math.max(1, Math.min(1024, Math.round(value) || 1));
}
</script>

<Card class="h-min flex flex-col gap-4 py-4">
    <div class="flex flex-col gap-4 mx-4">
        <span class="text-sm font-medium"> Brush </span>

        <div class="flex flex-col gap-2">
            <Label for="brush-size">Size</Label>

            <div class="flex items-center gap-3">
                <Slider
                    class="flex-1"
                    type="single"
                    min={1}
                    max={512}
                    step={1}
                    value={brushSize}
                    onValueChange={handleSliderChange}
                />

                <div class="flex items-center gap-2">
                    <Input
                        id="brush-size"
                        class="w-20 text-right"
                        type="number"
                        min="1"
                        max="512"
                        step="1"
                        value={brushSize}
                        oninput={handleInput}
                    />

                    <span class="text-sm text-muted-foreground"> px </span>
                </div>
            </div>
        </div>
    </div>
</Card>

<script lang="ts">
import { Card } from '$lib/components/ui/card';
import { Button } from '$lib/components/ui/button';
import { Slider } from '$lib/components/ui/slider';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';

import EyeIcon from 'phosphor-svelte/lib/EyeIcon';
import EyeSlashIcon from 'phosphor-svelte/lib/EyeSlashIcon';

import { CanvasManager } from '$lib/canvas/canvas';
import Separator from '$lib/components/ui/separator/separator.svelte';

interface Props {
    canvas: CanvasManager;
}

let { canvas }: Props = $props();

let visible = $state(true);
let opacity = $state(63);

function toggleVisibility(): void {
    visible = !visible;

    // TODO:
    // canvas.document.labelImage.setVisible(visible);
}

function handleSliderChange(value: number): void {
    opacity = value;

    // TODO:
    // canvas.document.labelImage.setOpacity(opacity / 100);
}

function handleInput(event: Event): void {
    const value = Number((event.currentTarget as HTMLInputElement).value);

    opacity = Math.max(0, Math.min(100, Math.round(value) || 0));

    // TODO:
    // canvas.document.labelImage.setOpacity(opacity / 100);
}
</script>

<Card class="h-min flex flex-col gap-4 py-4">
    <div class="flex flex-col gap-4 mx-4">
        <span class="text-sm font-medium"> Display </span>

        <Button
            variant={visible ? 'default' : 'secondary'}
            onclick={toggleVisibility}
            class={visible ? 'ring-2 bg-primary/10 ring-primary/40 hover:bg-primary/30' : ''}
        >
            {#if visible}
                <EyeIcon weight="bold" />
                Hide Labels
            {:else}
                <EyeSlashIcon weight="bold" />
                Show Labels
            {/if}
        </Button>

        <Separator class="mt-2"/>

        <div class="flex flex-col mt-2 gap-1">
            <Label for="label-opacity">Opacity</Label>

            <div class="flex items-center gap-3">
                <Slider
                    class="flex-1"
                    type="single"
                    min={0}
                    max={100}
                    step={1}
                    value={opacity}
                    onValueChange={handleSliderChange}
                />

                <div class="flex items-center gap-2">
                    <Input
                        id="label-opacity"
                        class="w-20 text-right"
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={opacity}
                        oninput={handleInput}
                    />

                    <span class="text-sm text-muted-foreground"> % </span>
                </div>
            </div>
        </div>
    </div>
</Card>

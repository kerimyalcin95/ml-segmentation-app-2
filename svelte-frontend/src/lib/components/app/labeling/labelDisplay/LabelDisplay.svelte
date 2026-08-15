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

import { sessionStore } from '$lib/components/stores/sessionStore.svelte';

interface Props {
    canvas: CanvasManager;
}

let { canvas }: Props = $props();

function toggleVisibility(): void {
    sessionStore.labeling.globalHidden = !sessionStore.labeling.globalHidden;
    sessionStore.labeling.enabled = !sessionStore.labeling.globalHidden;

    canvas.document.labelImage.setVisible(!sessionStore.labeling.globalHidden);
    canvas.document.events.emit('layerRedraw');
}

function handleSliderChange(value: number): void {
    sessionStore.labeling.globalOpacity = value;
    sessionStore.labeling.enabled = value !== 0;

    canvas.document.labelImage.setOpacity(value / 100);
    canvas.document.events.emit('layerRedraw');
}

function handleInput(event: Event): void {
    const value = Number((event.currentTarget as HTMLInputElement).value);

    sessionStore.labeling.globalOpacity = Math.max(
        0,
        Math.min(100, Math.round(value) || 0),
    );

    sessionStore.labeling.enabled = sessionStore.labeling.globalOpacity !== 0;
    canvas.document.labelImage.setOpacity(
        sessionStore.labeling.globalOpacity / 100,
    );
    canvas.document.events.emit('layerRedraw');
}
</script>

<Card class="h-min flex flex-col gap-4 py-4">
    <div class="flex flex-col gap-4 mx-4">
        <span class="text-sm font-medium"> Display </span>

        <Button
            variant={!sessionStore.labeling.globalHidden
                ? 'default'
                : 'secondary'}
            onclick={toggleVisibility}
            class={!sessionStore.labeling.globalHidden
                ? 'ring-2 bg-primary/10 ring-primary/40 hover:bg-primary/30'
                : ''}
        >
            {#if !sessionStore.labeling.globalHidden}
                <EyeIcon weight="bold" />
                Hide Labels
            {:else}
                <EyeSlashIcon weight="bold" />
                Show Labels
            {/if}
        </Button>

        <Separator class="mt-2" />

        <div class="flex flex-col mt-2 gap-1">
            <Label for="label-opacity">Opacity</Label>

            <div class="flex items-center gap-3">
                <Slider
                    class="flex-1"
                    type="single"
                    min={0}
                    max={100}
                    step={1}
                    value={sessionStore.labeling.globalOpacity}
                    onValueChange={handleSliderChange}
                />

                <div class="flex items-center gap-2">
                    <Input
                        id="label-opacity"
                        class="w-17 text-left"
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={sessionStore.labeling.globalOpacity}
                        oninput={handleInput}
                    />
                    <span class="text-sm text-muted-foreground"> % </span>
                </div>
            </div>
        </div>
    </div>
</Card>

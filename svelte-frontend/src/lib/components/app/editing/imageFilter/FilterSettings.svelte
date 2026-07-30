<script lang="ts">
import { Card } from '$lib/components/ui/card';
import { Slider } from '$lib/components/ui/slider';

import { type ActiveFilter, FilterType } from '$lib/types/filter';

interface Props {
    currentFilter?: ActiveFilter;
}

let { currentFilter }: Props = $props();
</script>

<Card class="p-4">
    <h3 class="font-medium mb-1">Filter Settings</h3>

    {#if currentFilter}
        <div class="space-y-3">
            <div class="text-sm">
                {FilterType[currentFilter.type]}
            </div>

            {#if currentFilter.type === FilterType.Blur}
                <Slider
                    type="single"
                    min={0}
                    max={100}
                    step={1}
                    bind:value={currentFilter.blurRadius}
                />
            {:else if currentFilter.type === FilterType.Brighten}
                <Slider
                    type="single"
                    min={-1}
                    max={1}
                    step={0.01}
                    bind:value={currentFilter.brightness}
                />
            {:else if currentFilter.type === FilterType.Contrast}
                <Slider
                    type="single"
                    min={-100}
                    max={100}
                    step={1}
                    bind:value={currentFilter.contrast}
                />
            {:else if currentFilter.type === FilterType.Enhance}
                <Slider
                    type="single"
                    min={0}
                    max={1}
                    step={0.01}
                    bind:value={currentFilter.enhance}
                />
            {:else if currentFilter.type === FilterType.Grayscale}
                <p class="text-sm text-muted-foreground">
                    Grayscale has no adjustable parameters.
                </p>
            {:else if currentFilter.type === FilterType.HSL}
                <div class="space-y-3">
                    <div>
                        <div class="text-sm mb-1">Hue</div>
                        <Slider
                            type="single"
                            min={-180}
                            max={180}
                            step={1}
                            bind:value={currentFilter.hue}
                        />
                    </div>

                    <div>
                        <div class="text-sm mb-1">Saturation</div>
                        <Slider
                            type="single"
                            min={-2}
                            max={2}
                            step={0.01}
                            bind:value={currentFilter.saturation}
                        />
                    </div>

                    <div>
                        <div class="text-sm mb-1">Luminance</div>
                        <Slider
                            type="single"
                            min={-2}
                            max={2}
                            step={0.01}
                            bind:value={currentFilter.luminance}
                        />
                    </div>
                </div>
            {:else if currentFilter.type === FilterType.Invert}
                <p class="text-sm text-muted-foreground">
                    Invert has no adjustable parameters.
                </p>
            {:else if currentFilter.type === FilterType.Mask}
                <Slider
                    type="single"
                    min={0}
                    max={1}
                    step={0.01}
                    bind:value={currentFilter.threshold}
                />
            {:else if currentFilter.type === FilterType.Noise}
                <Slider
                    type="single"
                    min={0}
                    max={1}
                    step={0.01}
                    bind:value={currentFilter.noise}
                />
            {:else if currentFilter.type === FilterType.Pixelate}
                <Slider
                    type="single"
                    min={1}
                    max={100}
                    step={1}
                    bind:value={currentFilter.pixelSize}
                />
            {:else if currentFilter.type === FilterType.Posterize}
                <Slider
                    type="single"
                    min={2}
                    max={255}
                    step={1}
                    bind:value={currentFilter.levels}
                />
            {:else if currentFilter.type === FilterType.RGB}
                <div class="space-y-3">
                    <div>
                        <div class="text-sm mb-1">Red</div>
                        <Slider
                            type="single"
                            min={0}
                            max={255}
                            step={1}
                            bind:value={currentFilter.red}
                        />
                    </div>

                    <div>
                        <div class="text-sm mb-1">Green</div>
                        <Slider
                            type="single"
                            min={0}
                            max={255}
                            step={1}
                            bind:value={currentFilter.green}
                        />
                    </div>

                    <div>
                        <div class="text-sm mb-1">Blue</div>
                        <Slider
                            type="single"
                            min={0}
                            max={255}
                            step={1}
                            bind:value={currentFilter.blue}
                        />
                    </div>
                </div>
            {:else if currentFilter.type === FilterType.Sepia}
                <p class="text-sm text-muted-foreground">
                    Sepia has no adjustable parameters.
                </p>
            {:else if currentFilter.type === FilterType.Solarize}
                <p class="text-sm text-muted-foreground">
                    Solarize has no adjustable parameters.
                </p>
            {:else if currentFilter.type === FilterType.Threshold}
                <Slider
                    type="single"
                    min={0}
                    max={1}
                    step={0.01}
                    bind:value={currentFilter.threshold}
                />
            {/if}
        </div>
    {:else}
        <p class="text-sm text-muted-foreground">Select a filter.</p>
    {/if}
</Card>

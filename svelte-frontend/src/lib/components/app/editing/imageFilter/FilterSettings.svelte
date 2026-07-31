<script lang="ts">
import { Card } from '$lib/components/ui/card';
import { Slider } from '$lib/components/ui/slider';
import * as Select from '$lib/components/ui/select';

import { type ActiveFilter, FilterType } from '$lib/types/filter';

interface Props {
    currentFilter?: ActiveFilter;
}

const blendModes: GlobalCompositeOperation[] = [
    'source-over',
    'source-in',
    'source-out',
    'source-atop',

    'destination-over',
    'destination-in',
    'destination-out',
    'destination-atop',

    'lighter',
    'copy',
    'xor',

    'multiply',
    'screen',
    'overlay',
    'darken',
    'lighten',

    'color-dodge',
    'color-burn',

    'hard-light',
    'soft-light',

    'difference',
    'exclusion',

    'hue',
    'saturation',
    'color',
    'luminosity',
];

let { currentFilter }: Props = $props();
</script>

<Card class="flex flex-col p-6 gap-4">
    <h3 class="font-medium mb-1">Filter Settings</h3>

    {#if currentFilter}
        <div class="space-y-2 border-t pt-4 mb-2">
            <div class="text-sm">
                {FilterType[currentFilter.type]}
            </div>

            <div>
                {#if currentFilter.type === FilterType.Blur}
                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-sm">Blur Radius</span>
                            <span class="text-xs text-muted-foreground">
                                {currentFilter.blurRadius.toFixed(0)}
                            </span>
                        </div>

                        <Slider
                            type="single"
                            min={0}
                            max={100}
                            step={1}
                            bind:value={currentFilter.blurRadius}
                        />
                    </div>
                {:else if currentFilter.type === FilterType.Brighten}
                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-sm">Value</span>
                            <span class="text-xs text-muted-foreground">
                                {currentFilter.brightness.toFixed(2)}
                            </span>
                        </div>

                        <Slider
                            type="single"
                            min={-1}
                            max={1}
                            step={0.01}
                            bind:value={currentFilter.brightness}
                        />
                    </div>
                {:else if currentFilter.type === FilterType.Contrast}
                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-sm">Value</span>
                            <span class="text-xs text-muted-foreground">
                                {currentFilter.contrast.toFixed(0)}
                            </span>
                        </div>

                        <Slider
                            type="single"
                            min={-100}
                            max={100}
                            step={1}
                            bind:value={currentFilter.contrast}
                        />
                    </div>
                {:else if currentFilter.type === FilterType.Enhance}
                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-sm">Value</span>
                            <span class="text-xs text-muted-foreground">
                                {currentFilter.enhance.toFixed(2)}
                            </span>
                        </div>

                        <Slider
                            type="single"
                            min={0}
                            max={1}
                            step={0.01}
                            bind:value={currentFilter.enhance}
                        />
                    </div>
                {:else if currentFilter.type === FilterType.Grayscale}
                    <p class="text-sm text-muted-foreground italic">
                        No paramers available
                    </p>
                {:else if currentFilter.type === FilterType.HSL}
                    <div class="space-y-3">
                        <div>
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-sm">Hue</span>
                                <span class="text-xs text-muted-foreground">
                                    {currentFilter.hue.toFixed(0)}°
                                </span>
                            </div>

                            <Slider
                                type="single"
                                min={-180}
                                max={180}
                                step={1}
                                bind:value={currentFilter.hue}
                            />
                        </div>

                        <div>
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-sm">Saturation</span>
                                <span class="text-xs text-muted-foreground">
                                    {currentFilter.saturation.toFixed(2)}
                                </span>
                            </div>

                            <Slider
                                type="single"
                                min={-2}
                                max={2}
                                step={0.01}
                                bind:value={currentFilter.saturation}
                            />
                        </div>

                        <div>
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-sm">Luminance</span>
                                <span class="text-xs text-muted-foreground">
                                    {currentFilter.luminance.toFixed(2)}
                                </span>
                            </div>

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
                    <p class="text-sm text-muted-foreground italic">
                        No paramers available
                    </p>
                {:else if currentFilter.type === FilterType.Mask}
                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-sm">Threshold</span>
                            <span class="text-xs text-muted-foreground">
                                {currentFilter.threshold.toFixed(2)}
                            </span>
                        </div>

                        <Slider
                            type="single"
                            min={0}
                            max={1}
                            step={0.01}
                            bind:value={currentFilter.threshold}
                        />
                    </div>
                {:else if currentFilter.type === FilterType.Noise}
                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-sm">Amount</span>
                            <span class="text-xs text-muted-foreground">
                                {currentFilter.noise.toFixed(2)}
                            </span>
                        </div>

                        <Slider
                            type="single"
                            min={0}
                            max={1}
                            step={0.01}
                            bind:value={currentFilter.noise}
                        />
                    </div>
                {:else if currentFilter.type === FilterType.Pixelate}
                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-sm">Pixel Size</span>
                            <span class="text-xs text-muted-foreground">
                                {currentFilter.pixelSize.toFixed(0)} px
                            </span>
                        </div>

                        <Slider
                            type="single"
                            min={1}
                            max={100}
                            step={1}
                            bind:value={currentFilter.pixelSize}
                        />
                    </div>
                {:else if currentFilter.type === FilterType.Posterize}
                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-sm">Levels</span>
                            <span class="text-xs text-muted-foreground">
                                {currentFilter.levels.toFixed(0)}
                            </span>
                        </div>

                        <Slider
                            type="single"
                            min={2}
                            max={255}
                            step={1}
                            bind:value={currentFilter.levels}
                        />
                    </div>
                {:else if currentFilter.type === FilterType.RGB}
                    <div class="space-y-3">
                        <div>
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-sm">Red</span>
                                <span class="text-xs text-muted-foreground">
                                    {currentFilter.red.toFixed(0)}
                                </span>
                            </div>

                            <Slider
                                type="single"
                                min={0}
                                max={255}
                                step={1}
                                bind:value={currentFilter.red}
                            />
                        </div>

                        <div>
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-sm">Green</span>
                                <span class="text-xs text-muted-foreground">
                                    {currentFilter.green.toFixed(0)}
                                </span>
                            </div>

                            <Slider
                                type="single"
                                min={0}
                                max={255}
                                step={1}
                                bind:value={currentFilter.green}
                            />
                        </div>

                        <div>
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-sm">Blue</span>
                                <span class="text-xs text-muted-foreground">
                                    {currentFilter.blue.toFixed(0)}
                                </span>
                            </div>

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
                    <p class="text-sm text-muted-foreground italic">
                        No paramers available
                    </p>
                {:else if currentFilter.type === FilterType.Solarize}
                    <p class="text-sm text-muted-foreground italic">
                        No paramers available
                    </p>
                {:else if currentFilter.type === FilterType.Threshold}
                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-sm">Value</span>
                            <span class="text-xs text-muted-foreground">
                                {currentFilter.threshold.toFixed(2)}
                            </span>
                        </div>

                        <Slider
                            type="single"
                            min={0}
                            max={1}
                            step={0.01}
                            bind:value={currentFilter.threshold}
                        />
                    </div>
                {/if}
            </div>
        </div>

        <div class="space-y-2 border-t pt-4">
            <div class="text-sm font-medium">Opacity</div>

            <div class="flex justify-between items-center mb-1">
                <span class="text-sm">Value</span>
                <span class="text-xs text-muted-foreground">
                    {currentFilter.opacity}
                </span>
            </div>

            <Slider
                type="single"
                min={0}
                max={1}
                step={0.01}
                bind:value={currentFilter.opacity}
            />
        </div>

        <div class="space-y-2 border-t pt-4 mb-2">
            <div class="text-sm font-medium">Blend Mode</div>

            <Select.Root type="single" bind:value={currentFilter.blendMode}>
                <Select.Trigger class="w-full">
                    {currentFilter.blendMode}
                </Select.Trigger>

                <Select.Content>
                    {#each blendModes as mode (mode)}
                        <Select.Item value={mode}>
                            {mode}
                        </Select.Item>
                    {/each}
                </Select.Content>
            </Select.Root>
        </div>
    {:else}
        <p class="text-sm text-muted-foreground italic">Select a filter.</p>
    {/if}
</Card>

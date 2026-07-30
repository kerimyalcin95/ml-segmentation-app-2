<script lang="ts">
import { Button } from '$lib/components/ui/button';
import * as Select from '$lib/components/ui/select';
import PlusIcon from 'phosphor-svelte/lib/PlusIcon';

import { FilterType, type FilterState } from '$lib/types/filter';

interface Props {
    activeFilters: ActiveFilter[];
}

type ActiveFilter = {
    id: number;
    state: FilterState;
};

let { activeFilters }: Props = $props();

const availableFilters: {
    name: string;
    create: () => FilterState;
}[] = [
    {
        name: 'Blur',
        create: () => ({
            type: FilterType.Blur,
            blurRadius: 10,
            opacity: 1,
            blendMode: 'source-over',
        }),
    },
    {
        name: 'Brighten',
        create: () => ({
            type: FilterType.Brighten,
            brightness: 0,
            opacity: 1,
            blendMode: 'source-over',
        }),
    },
    {
        name: 'Contrast',
        create: () => ({
            type: FilterType.Contrast,
            contrast: 0,
            opacity: 1,
            blendMode: 'source-over',
        }),
    },
    {
        name: 'Enhance',
        create: () => ({
            type: FilterType.Enhance,
            enhance: 0,
            opacity: 1,
            blendMode: 'source-over',
        }),
    },
    {
        name: 'Grayscale',
        create: () => ({
            type: FilterType.Grayscale,
            opacity: 1,
            blendMode: 'source-over',
        }),
    },
    {
        name: 'HSL',
        create: () => ({
            type: FilterType.HSL,
            hue: 0,
            saturation: 0,
            luminance: 0,
            opacity: 1,
            blendMode: 'source-over',
        }),
    },
    {
        name: 'Invert',
        create: () => ({
            type: FilterType.Invert,
            opacity: 1,
            blendMode: 'source-over',
        }),
    },
    {
        name: 'Mask',
        create: () => ({
            type: FilterType.Mask,
            threshold: 0.5,
            opacity: 1,
            blendMode: 'source-over',
        }),
    },
    {
        name: 'Noise',
        create: () => ({
            type: FilterType.Noise,
            noise: 0,
            opacity: 1,
            blendMode: 'source-over',
        }),
    },
    {
        name: 'Pixelate',
        create: () => ({
            type: FilterType.Pixelate,
            pixelSize: 8,
            opacity: 1,
            blendMode: 'source-over',
        }),
    },
    {
        name: 'Posterize',
        create: () => ({
            type: FilterType.Posterize,
            levels: 0.5,
            opacity: 1,
            blendMode: 'source-over',
        }),
    },
    {
        name: 'RGB',
        create: () => ({
            type: FilterType.RGB,
            red: 0,
            green: 0,
            blue: 0,
            opacity: 1,
            blendMode: 'source-over',
        }),
    },
    {
        name: 'Sepia',
        create: () => ({
            type: FilterType.Sepia,
            opacity: 1,
            blendMode: 'source-over',
        }),
    },
    {
        name: 'Solarize',
        create: () => ({
            type: FilterType.Solarize,
            opacity: 1,
            blendMode: 'source-over',
        }),
    },
    {
        name: 'Threshold',
        create: () => ({
            type: FilterType.Threshold,
            threshold: 0.5,
            opacity: 1,
            blendMode: 'source-over',
        }),
    },
];

let selectedFilter = $state('');

function addFilter() {
    const filter = availableFilters.find(
        (item) => item.name === selectedFilter,
    );

    if (!filter) return;

    activeFilters.push({
        id: Date.now(),
        state: filter.create(),
    });

    selectedFilter = '';
}
</script>

<div class="space-y-2">
    <div class="flex gap-2">
        <Select.Root type="single" bind:value={selectedFilter}>
            <Select.Trigger class="flex-1">
                {selectedFilter || 'Select filter'}
            </Select.Trigger>

            <Select.Content>
                {#each availableFilters as filter (filter.name)}
                    <Select.Item value={filter.name}>
                        {filter.name}
                    </Select.Item>
                {/each}
            </Select.Content>
        </Select.Root>

        <Button size="icon" onclick={addFilter}>
            <PlusIcon weight="bold" />
        </Button>
    </div>
</div>

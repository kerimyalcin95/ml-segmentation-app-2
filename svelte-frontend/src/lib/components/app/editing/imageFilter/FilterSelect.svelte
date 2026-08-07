<script lang="ts">
import { Button } from '$lib/components/ui/button';
import * as Select from '$lib/components/ui/select';
import PlusIcon from 'phosphor-svelte/lib/PlusIcon';

import {
    FilterType,
    type FilterState,
    type ActiveFilter,
} from '$lib/types/filter';
import { sessionStore } from '$lib/components/stores/sessionStore.svelte';

interface Props {
    activeFilters: ActiveFilter[];
}

let { activeFilters }: Props = $props();

const defaultFilterSettings = {
    opacity: 1,
    blendMode: 'source-over' as const,
};

const availableFilters: {
    name: string;
    create: () => FilterState;
}[] = [
    {
        name: 'Blur',
        create: () => ({
            type: FilterType.Blur,
            blurRadius: 10,
            ...defaultFilterSettings,
        }),
    },
    {
        name: 'Brighten',
        create: () => ({
            type: FilterType.Brighten,
            brightness: 0,
            ...defaultFilterSettings,
        }),
    },
    {
        name: 'Contrast',
        create: () => ({
            type: FilterType.Contrast,
            contrast: 0,
            ...defaultFilterSettings,
        }),
    },
    {
        name: 'Enhance',
        create: () => ({
            type: FilterType.Enhance,
            enhance: 0,
            ...defaultFilterSettings,
        }),
    },
    {
        name: 'Grayscale',
        create: () => ({
            type: FilterType.Grayscale,
            ...defaultFilterSettings,
        }),
    },
    {
        name: 'HSL',
        create: () => ({
            type: FilterType.HSL,
            hue: 0,
            saturation: 0,
            luminance: 0,
            ...defaultFilterSettings,
        }),
    },
    {
        name: 'Invert',
        create: () => ({
            type: FilterType.Invert,
            ...defaultFilterSettings,
        }),
    },
    {
        name: 'Mask',
        create: () => ({
            type: FilterType.Mask,
            threshold: 0.5,
            ...defaultFilterSettings,
        }),
    },
    {
        name: 'Noise',
        create: () => ({
            type: FilterType.Noise,
            noise: 0,
            ...defaultFilterSettings,
        }),
    },
    {
        name: 'Pixelate',
        create: () => ({
            type: FilterType.Pixelate,
            pixelSize: 8,
            ...defaultFilterSettings,
        }),
    },
    {
        name: 'Posterize',
        create: () => ({
            type: FilterType.Posterize,
            levels: 0.5,
            ...defaultFilterSettings,
        }),
    },
    {
        name: 'RGB',
        create: () => ({
            type: FilterType.RGB,
            red: 0,
            green: 0,
            blue: 0,
            ...defaultFilterSettings,
        }),
    },
    {
        name: 'Sepia',
        create: () => ({
            type: FilterType.Sepia,
            ...defaultFilterSettings,
        }),
    },
    {
        name: 'Solarize',
        create: () => ({
            type: FilterType.Solarize,
            ...defaultFilterSettings,
        }),
    },
    {
        name: 'Threshold',
        create: () => ({
            type: FilterType.Threshold,
            threshold: 0.5,
            ...defaultFilterSettings,
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
        ...filter.create(),
    });

    selectedFilter = '';
}
</script>

<div class="space-y-2">
    <div class="flex gap-2">
        <Select.Root
            type="single"
            disabled={!sessionStore.hasImage && !sessionStore.hasLabelImage}
            bind:value={selectedFilter}
        >
            <Select.Trigger class="flex-1">
                {selectedFilter || 'Select filter'}
            </Select.Trigger>

            <Select.Content class="max-h-50">
                {#each availableFilters as filter (filter.name)}
                    <Select.Item value={filter.name}>
                        {filter.name}
                    </Select.Item>
                {/each}
            </Select.Content>
        </Select.Root>

        <Button size="icon" onclick={addFilter} disabled={!sessionStore.hasImage && !sessionStore.hasLabelImage}>
            <PlusIcon weight="bold" />
        </Button>
    </div>
</div>

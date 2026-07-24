<script lang="ts">
import { Button } from '$lib/components/ui/button';
import * as Select from '$lib/components/ui/select';
import { PlusIcon } from 'phosphor-svelte';

type Filter = {
    id: number;
    name: string;
    value: number;
};

interface Props {
    activeFilters: Filter[];
}

let { activeFilters }: Props = $props();

const availableFilters = [
    {
        name: 'Brightness',
        defaultValue: 0,
    },
    {
        name: 'Blur',
        defaultValue: 10,
    },
    {
        name: 'Contrast',
        defaultValue: 0,
    },
    {
        name: 'Grayscale',
        defaultValue: 100,
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
        name: filter.name,
        value: filter.defaultValue,
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
                {#each availableFilters as filter}
                    <Select.Item value={filter.name}>
                        {filter.name}
                    </Select.Item>
                {/each}
            </Select.Content>
        </Select.Root>

        <Button size="icon" onclick={addFilter}>
            <PlusIcon weight="bold"/>
        </Button>
    </div>
</div>

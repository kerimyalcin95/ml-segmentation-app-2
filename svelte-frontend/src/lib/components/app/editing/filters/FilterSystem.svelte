<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { Card } from '$lib/components/ui/card';

import FilterSelect from '$lib/components/app/editing/filters/FilterSelect.svelte';
import FilterDragList from '$lib/components/app/editing/filters/FilterDragList.svelte';
import FilterSettings from '$lib/components/app/editing/filters/FilterSettings.svelte';

import type { Filter } from '$lib/types/filter';
import { CanvasManager } from '$lib/canvas/canvas';

interface Props {
    canvas: CanvasManager;
}

let { canvas }: Props = $props();

let activeFilters = $state<Filter[]>([]);

let selectedFilterId = $state<number | null>(null);

let currentFilter = $derived(
    activeFilters.find((filter) => filter.id === selectedFilterId),
);

function applyFilters() {
    canvas.setGrayscale(true);
}
</script>

<Card class="h-min flex flex-col gap-4 py-4">
    <div class="flex flex-col gap-2 mx-4">
        <span class="text-sm font-medium mb-2"> Filters </span>
        <FilterSelect {activeFilters} />

        <FilterDragList
            {activeFilters}
            {selectedFilterId}
            onSelectFilter={(id) => (selectedFilterId = id)}
            onFiltersChanged={(filters) => (activeFilters = filters)}
            onReorder={(filters) => (activeFilters = filters)}
        />

        <FilterSettings {currentFilter} />

        <Button class="mt-2" onclick={applyFilters}
            >Apply filters</Button
        >
    </div>
</Card>

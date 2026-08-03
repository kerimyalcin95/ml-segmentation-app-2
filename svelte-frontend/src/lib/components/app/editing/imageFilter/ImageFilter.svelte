<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { Card } from '$lib/components/ui/card';

import FilterSelect from '$lib/components/app/editing/imageFilter/FilterSelect.svelte';
import FilterDragList from '$lib/components/app/editing/imageFilter/FilterDragList.svelte';
import FilterSettings from '$lib/components/app/editing/imageFilter/FilterSettings.svelte';

import type { ActiveFilter } from '$lib/types/filter';
import { CanvasManager } from '$lib/canvas/canvas';

import CircleHalfIcon from 'phosphor-svelte/lib/CircleHalfIcon';

interface Props {
    canvas: CanvasManager;
}

let { canvas }: Props = $props();

let activeFilters = $state<ActiveFilter[]>([]);

let selectedFilterId = $state<number | null>(null);

let currentFilter = $derived(
    activeFilters.find((filter) => filter.id === selectedFilterId),
);


function applyFilters(): void {
    canvas.document.image.setFilters(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        activeFilters.map(({ id, ...filter }) => filter),
    );
}
</script>

<Card class="h-min flex flex-col gap-4 py-4">
    <div class="flex flex-col gap-2 mx-4">
        <span class="text-sm font-medium mb-2"> Filters </span>
        <FilterSelect {activeFilters} />

        <FilterDragList
            {activeFilters}
            {selectedFilterId}
            onSelectFilter={(id: number | null) => {
                selectedFilterId = id;
            }}
            onFiltersChanged={(filters: ActiveFilter[]) => {
                activeFilters = filters;
            }}
            onReorder={(filters: ActiveFilter[]) => {
                activeFilters = filters;
            }}
        />

        <FilterSettings {currentFilter} />

        <Button class="mt-2" onclick={applyFilters}>
            <CircleHalfIcon weight="bold" />
            Apply filters
        </Button>
    </div>
</Card>

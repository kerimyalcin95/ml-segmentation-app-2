<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { Card } from '$lib/components/ui/card';

import FilterSelect from '$lib/components/app/editing/imageFilter/FilterSelect.svelte';
import FilterDragList from '$lib/components/app/editing/imageFilter/FilterDragList.svelte';
import FilterSettings from '$lib/components/app/editing/imageFilter/FilterSettings.svelte';

import type { ActiveFilter } from '$lib/types/filter';
import { CanvasManager } from '$lib/canvas/canvas';

import CircleHalfIcon from 'phosphor-svelte/lib/CircleHalfIcon';
import { sessionStore } from '$lib/components/stores/sessionStore.svelte';

interface Props {
    canvas: CanvasManager;
}

let { canvas }: Props = $props();

let currentFilter = $derived(
    sessionStore.editing.activeFilters.find(
        (filter) => filter.id === sessionStore.editing.selectedFilterId,
    ),
);

function applyFilters(): void {
    canvas.document.image.setFilters(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        sessionStore.editing.activeFilters.map(({ id, ...filter }) => filter),
    );
}
</script>

<Card class="h-min flex flex-col gap-4 py-4">
    <div class="flex flex-col gap-2 mx-4">
        <span class="text-sm font-medium mb-2"> Filters </span>
        <FilterSelect activeFilters={sessionStore.editing.activeFilters} />

        <FilterDragList
            activeFilters={sessionStore.editing.activeFilters}
            selectedFilterId={sessionStore.editing.selectedFilterId}
            onSelectFilter={(id: number | null) => {
                sessionStore.editing.selectedFilterId = id;
            }}
            onFiltersChanged={(filters: ActiveFilter[]) => {
                sessionStore.editing.activeFilters = filters;
            }}
            onReorder={(filters: ActiveFilter[]) => {
                sessionStore.editing.activeFilters = filters;
            }}
            disabled={!sessionStore.hasImage || sessionStore.hasLabelImage}
        />

        <FilterSettings
            {currentFilter}
            disabled={!sessionStore.hasImage || sessionStore.hasLabelImage}
        />

        <Button
            class="mt-2"
            onclick={applyFilters}
            disabled={!sessionStore.hasImage || sessionStore.hasLabelImage}
        >
            <CircleHalfIcon weight="bold" />
            Apply filters
        </Button>
    </div>
</Card>

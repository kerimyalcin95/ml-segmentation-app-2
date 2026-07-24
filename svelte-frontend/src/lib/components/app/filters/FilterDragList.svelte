<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { Card } from '$lib/components/ui/card';
import { dndzone } from 'svelte-dnd-action';

type Filter = {
    id: number;
    name: string;
    value: number;
};

interface Props {
    activeFilters: Filter[];
    selectedFilterId: number | null;

    onSelectFilter: (id: number) => void;
    onFiltersChanged: (filters: Filter[]) => void;
    onReorder: (filters: Filter[]) => void;
}

let {
    activeFilters,
    selectedFilterId,
    onSelectFilter,
    onFiltersChanged,
    onReorder,
}: Props = $props();

function handleFilterReorder(event: CustomEvent) {
    onReorder(event.detail.items);
}

function removeFilter(id: number) {
    const newFilters = activeFilters.filter((filter) => filter.id !== id);

    onFiltersChanged(newFilters);

    if (selectedFilterId === id) {
        onSelectFilter(null as any);
    }
}
</script>

<div
    class="space-y-4"
    use:dndzone={{
        items: activeFilters,
        flipDurationMs: 200,
        dropTargetStyle: {},
    }}
    onconsider={handleFilterReorder}
    onfinalize={handleFilterReorder}
>
    {#each activeFilters as filter (filter.id)}
        <Card
            class="
            p-3
            my-2
            cursor-pointer
            transition-colors
            hover:bg-accent
            {selectedFilterId === filter.id ? 'bg-accent' : ''}
            "
            onclick={() => onSelectFilter(filter.id)}
        >
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <span class="cursor-grab select-none text-muted-foreground">
                        ☰
                    </span>

                    <span class="font-medium">
                        {filter.name}
                    </span>
                </div>

                <Button
                    size="icon"
                    variant="destructive"
                    onclick={(event) => {
                        event.stopPropagation();
                        removeFilter(filter.id);
                    }}
                >
                    ×
                </Button>
            </div>
        </Card>
    {/each}
</div>

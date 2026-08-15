<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';

import FolderOpenIcon from 'phosphor-svelte/lib/FolderOpenIcon';
import FloppyDiskIcon from 'phosphor-svelte/lib/FloppyDiskIcon';

import { sessionStore } from '$lib/components/stores/sessionStore.svelte';
</script>

<div class="flex flex-col gap-3">
    <span class="text-sm font-medium">
        Model
    </span>

    <div class="flex flex-col gap-1">
        <Label for="training-model-path">
            Model Path
        </Label>

        <Input
            id="training-model-path"
            bind:value={sessionStore.training.modelPath}
            placeholder="Model file"
            disabled={sessionStore.training.running}
        />
    </div>

    <Button
        disabled={sessionStore.training.running}
    >
        <FolderOpenIcon weight="bold" />
        Load Model
    </Button>

    <Button
        disabled={
            sessionStore.training.running ||
            !sessionStore.training.modelPath
        }
    >
        <FloppyDiskIcon weight="bold" />
        Save Model
    </Button>
</div>
<script lang="ts">
import { Card } from '$lib/components/ui/card';
import { Label } from '$lib/components/ui/label';
import * as Select from '$lib/components/ui/select';
import { Switch } from '$lib/components/ui/switch';

import { sessionStore } from '$lib/components/stores/sessionStore.svelte';
import { type fastaiArch } from '$lib/types/training';
import * as localStorage from '$lib/utils/localStorage';

const architectures: {
    value: fastaiArch;
    label: string;
}[] = [
    {
        value: 'resnet18',
        label: 'ResNet18',
    },
    {
        value: 'resnet34',
        label: 'ResNet34',
    },
    {
        value: 'resnet50',
        label: 'ResNet50',
    },
    {
        value: 'resnet101',
        label: 'ResNet101',
    },
    {
        value: 'resnet152',
        label: 'ResNet152',
    },
];

function saveSession(): void {
    void localStorage.save();
}
</script>

<Card class="h-min flex flex-col gap-4 py-4">
    <div class="flex flex-col gap-4 mx-4">
        <span class="text-sm font-medium"> Learner </span>

        <div class="flex flex-col gap-1">
            <Label for="learner-architecture">Architecture</Label>

            <Select.Root
                type="single"
                bind:value={sessionStore.training.architecture}
                onValueChange={saveSession}
                disabled={sessionStore.training.running}
            >
                <Select.Trigger id="learner-architecture">
                    {architectures.find(
                        (architecture) =>
                            architecture.value ===
                            sessionStore.training.architecture,
                    )?.label}
                </Select.Trigger>

                <Select.Content>
                    {#each architectures as architecture (architecture.value)}
                        <Select.Item value={architecture.value}>
                            {architecture.label}
                        </Select.Item>
                    {/each}
                </Select.Content>
            </Select.Root>
        </div>

        <div class="flex items-center justify-between">
            <Label for="learner-pretrained">Pretrained</Label>

            <Switch
                id="learner-pretrained"
                bind:checked={sessionStore.training.pretrained}
                onchange={saveSession}
                disabled={sessionStore.training.running}
            />
        </div>
    </div>
</Card>

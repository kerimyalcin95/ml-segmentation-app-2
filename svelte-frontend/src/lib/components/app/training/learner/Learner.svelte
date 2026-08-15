<script lang="ts">
import { Card } from '$lib/components/ui/card';
import { Label } from '$lib/components/ui/label';
import * as Select from '$lib/components/ui/select';
import { Switch } from '$lib/components/ui/switch';

import { sessionStore } from '$lib/components/stores/sessionStore.svelte';
</script>

<Card class="h-min flex flex-col gap-4 py-4">
    <div class="flex flex-col gap-4 mx-4">
        <span class="text-sm font-medium">
            Learner
        </span>

        <div class="flex flex-col gap-1">
            <Label for="learner-architecture">
                Architecture
            </Label>

            <Select.Root
                type="single"
                bind:value={sessionStore.training.architecture}
                disabled={sessionStore.training.running}
            >
                <Select.Trigger id="learner-architecture">
                    {sessionStore.training.architecture === 'resnet34'
                        ? 'ResNet34'
                        : sessionStore.training.architecture}
                </Select.Trigger>

                <Select.Content>
                    <Select.Item value="resnet34">
                        ResNet34
                    </Select.Item>
                </Select.Content>
            </Select.Root>
        </div>

        <div class="flex items-center justify-between">
            <Label for="learner-pretrained">
                Pretrained
            </Label>

            <Switch
                id="learner-pretrained"
                bind:checked={sessionStore.training.pretrained}
                disabled={sessionStore.training.running}
            />
        </div>
    </div>
</Card>
<script module lang="ts">
declare const __BUILD_TIME__: string;
declare const __APP_VERSION__: string;
</script>

<script lang="ts">
import { onMount } from 'svelte';

import { setupConnectivity, isOnline } from '$lib/utils/connectivity';
import { sessionStore } from '$lib/components/stores/sessionStore.svelte';
import * as localStorage from '$lib/utils/localStorage';
import * as AlertDialog from '$lib/components/ui/alert-dialog';

const MIN_PORT = 1024;
const MAX_PORT = 65535;
const RANDOM_PORT_MIN = 1024;
const RANDOM_PORT_MAX = 65535;

let portDialogOpen = $state(false);
let portInput = $state(String(sessionStore.port));
let portError = $state('');

function openPortDialog(): void {
    portInput = String(sessionStore.port);
    portError = '';
    portDialogOpen = true;
}

function generateRandomPort(): void {
    const range = RANDOM_PORT_MAX - RANDOM_PORT_MIN + 1;
    const random = new Uint32Array(1);

    crypto.getRandomValues(random);

    const port = RANDOM_PORT_MIN + (random[0] % range);

    portInput = String(port);
    portError = '';
}

async function savePort(): Promise<void> {
    const port = Number(portInput);

    if (!Number.isInteger(port) || port < MIN_PORT || port > MAX_PORT) {
        portError =
            'Please enter a valid port between ' +
            String(MIN_PORT) +
            ' and ' +
            String(MAX_PORT) +
            '.';

        return;
    }

    if (port === sessionStore.port) {
        portDialogOpen = false;
        return;
    }

    portError = '';

    try {
        await window.electronAPI.restartPythonServer(port);

        sessionStore.port = port;
        await localStorage.save();

        portDialogOpen = false;
    } catch (error) {
        portError =
            error instanceof Error
                ? error.message
                : 'Failed to restart the Python server.';
    }
}

onMount(() => {
    const connectivityCleanup = setupConnectivity();

    return () => {
        connectivityCleanup();
    };
});
</script>

<div
    data-e2e="statusbar"
    class="h-8 border-t px-4 flex items-center justify-between text-sm text-muted-foreground"
>
    <button
        type="button"
        class="hover:text-foreground transition-colors"
        onclick={openPortDialog}
    >
        Python server:
        {$isOnline ? 'Online' : 'Offline'}
        · Port {sessionStore.port}
    </button>

    <span>
        v{__APP_VERSION__}
        | Build {__BUILD_TIME__}
    </span>
</div>

<AlertDialog.Root bind:open={portDialogOpen}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>
                Python Server Port
            </AlertDialog.Title>

            <AlertDialog.Description>
                Changing the port will restart the Python server.
                AI functionality will be temporarily unavailable while
                the server restarts.
            </AlertDialog.Description>
        </AlertDialog.Header>

        <div class="space-y-2">
            <div class="flex gap-2">
                <input
                    type="number"
                    min={MIN_PORT}
                    max={MAX_PORT}
                    step="1"
                    bind:value={portInput}
                    class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    aria-label="Python server port"
                />

                <button
                    type="button"
                    class="h-9 rounded-md border border-input px-3 text-sm hover:bg-accent hover:text-accent-foreground"
                    onclick={generateRandomPort}
                >
                    Random
                </button>
            </div>

            <p class="text-xs text-muted-foreground">
                Allowed range: {MIN_PORT}–{MAX_PORT}.
                Random ports are generated from
                {RANDOM_PORT_MIN}–{RANDOM_PORT_MAX}.
            </p>

            {#if portError}
                <p class="text-sm text-destructive">
                    {portError}
                </p>
            {/if}
        </div>

        <AlertDialog.Footer>
            <AlertDialog.Cancel>
                Cancel
            </AlertDialog.Cancel>

            <AlertDialog.Action onclick={savePort}>
                Restart Server
            </AlertDialog.Action>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>

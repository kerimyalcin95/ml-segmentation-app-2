<script lang="ts">
import { onMount } from 'svelte';

import { Terminal as TerminalManager } from '$lib/terminal/terminal';

let container: HTMLDivElement;

let terminal: TerminalManager;

interface Props {
    onTerminalReady?: (terminal: TerminalManager) => void;
}

let { onTerminalReady }: Props = $props();

import { tick } from 'svelte';

onMount(() => {
    let unsubscribe: (() => void) | undefined;

    void (async () => {
        await tick();

        console.log('Mounted:', container.clientWidth, container.clientHeight);

        terminal = new TerminalManager(container);

        onTerminalReady?.(terminal);

        terminal.writeln('');
        terminal.writeln('');
        terminal.writeln('');
        terminal.writeln('');
        terminal.writeln('ML Segmentation');
        terminal.writeln('Terminal initialized.');
        terminal.writeln('');

        const decoder = new TextDecoder();

        unsubscribe = window.electronAPI.onTerminalData((chunk) => {
            terminal.write(decoder.decode(chunk));
        });
    })();

    return () => {
        unsubscribe?.();
        terminal.destroy();
    };
});
</script>

<div
    bind:this={container}
    data-e2e="terminal"
    class="absolute inset-0 bg-background"
></div>

<style>
:global(.xterm-viewport) {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE/old Edge */
}

:global(.xterm-viewport::-webkit-scrollbar) {
    width: 0;
    height: 0;
}

:global(.xterm) {
    user-select: text;
}

:global(.xterm-screen) {
    user-select: none;
}

:global(.xterm-selection) {
    user-select: text;
}
</style>

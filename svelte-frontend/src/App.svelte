<script context="module" lang="ts">
    declare const __BUILD_TIME__: string;
</script>

<script lang="ts">
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { ModeWatcher } from 'mode-watcher';
    import { Separator } from 'bits-ui';
    import { Button } from '$lib/components/ui/button/index.js';

    onMount(() => {
        const query = window.matchMedia("(prefers-color-scheme: dark)");

        function updateTheme(e: MediaQueryList | MediaQueryListEvent) {
            document.documentElement.classList.toggle("dark", e.matches);
        }

        updateTheme(query);

        query.addEventListener("change", updateTheme);

        return () => {
            query.removeEventListener("change", updateTheme);
        };
    });

    const count = writable(0);
    const message = writable(0);

    const buildTime = __BUILD_TIME__;

    onMount(() => {
        window.electronAPI.onMessage((msg) => {
            let number = parseInt(msg) | 0;
            message.set(number + 1000);
        });
    });

    function increment() {
        count.update((n) => n + 1);
        window.electronAPI.sendMessage($count.toString());
    }
</script>

<div class="min-h-screen flex items-center justify-center">
    <div class="w-50 flex flex-col gap-6 items-center justify-center">
        <p class="w-full text-center font-bold font-mono rounded-lg bg-secondary p-4 text-secondary-foreground">
            Build {buildTime}
        </p>
        <Separator.Root
            class="w-25 bg-border my-0 shrink-0 data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-25 data-[orientation=horizontal]:w-25 data-[orientation=vertical]:w-px"
        />
        <Button class="w-full font-bold" onclick={increment}>Increment</Button>
        <p class="text-center w-full rounded-lg bg-secondary p-4 text-secondary-foreground">
            {$count} + 1000: {$message}
        </p>
    </div>
</div>

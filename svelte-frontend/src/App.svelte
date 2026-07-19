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
        const query = window.matchMedia('(prefers-color-scheme: dark)');

        function updateTheme(e: MediaQueryList | MediaQueryListEvent) {
            document.documentElement.classList.toggle('dark', e.matches);
        }

        updateTheme(query);

        query.addEventListener('change', updateTheme);

        return () => {
            query.removeEventListener('change', updateTheme);
        };
    });

    const count = writable(0);
    const message = writable(0);
    const isOnline = writable(0);

    const buildTime = __BUILD_TIME__;

    onMount(() => {
        let received = false;

        const retry = setInterval(() => {
            if (!received) {
                window.electronAPI.sendMessage($isOnline.toString());
                window.electronAPI.log("Retrying to connect");
            }
        }, 1000);

        window.electronAPI.onMessage((msg) => {
            received = true;
            clearInterval(retry);

            let state = parseInt(msg) || 0;

            if (state === 0) state = 1;

            isOnline.set(state);
        });

        return () => clearInterval(retry);
    });
</script>

<div class="min-h-screen flex items-center justify-center">
    <div class="w-50 flex flex-col gap-6 items-center justify-center">
        <p class="w-full text-center font-bold font-mono rounded-lg bg-secondary p-4 text-secondary-foreground">
            Build {buildTime}<br />
            Python server: {$isOnline}
        </p>
    </div>
</div>

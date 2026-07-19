<script context="module" lang="ts">
    declare const __BUILD_TIME__: string;
</script>

<script lang="ts">
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { ModeWatcher } from 'mode-watcher';
    import { Separator } from '$lib/components/ui/separator';
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

<div class="fixed bottom-0 left-0 w-full bg-background border-t">
    <Separator />

    <div class="h-min px-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>
            Python server: {$isOnline ? "Online" : "Offline"}
        </span>

        <span>
            Build {buildTime}
        </span>
    </div>
</div>

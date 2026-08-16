import {
    sessionStore,
    type PersistedSession,
} from '$lib/components/stores/sessionStore.svelte';

export async function load(): Promise<PersistedSession | null> {
    const session =
        await window.electronAPI.loadSession();

    return session as PersistedSession | null;
}

export async function save(): Promise<void> {
    await window.electronAPI.saveSession(
        sessionStore.toJSON(),
    );
}
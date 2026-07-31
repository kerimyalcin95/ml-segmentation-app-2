class SessionStore {
    lastDirectory = $state<string>();
}

export const sessionStore = new SessionStore();
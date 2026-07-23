export function darkThemeSetup() {
    const query = window.matchMedia('(prefers-color-scheme: dark)');

    const apply = (dark: boolean) => {
        document.documentElement.classList.toggle('dark', dark);
    };

    apply(query.matches);

    const listener = (e: MediaQueryListEvent) => {
        apply(e.matches);
    };

    query.addEventListener('change', listener);

    return () => {
        query.removeEventListener('change', listener);
    };
}
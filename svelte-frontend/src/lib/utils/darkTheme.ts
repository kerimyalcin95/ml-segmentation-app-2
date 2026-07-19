export function darkThemeSetup() {
    const query = window.matchMedia('(prefers-color-scheme: dark)');

    function updateTheme(e: MediaQueryList | MediaQueryListEvent) {
        document.documentElement.classList.toggle('dark', e.matches);
    }

    updateTheme(query);

    query.addEventListener('change', updateTheme);

    return () => {
        query.removeEventListener('change', updateTheme);
    };
}


import { Terminal as XTerm } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';

import 'xterm/css/xterm.css';

export class Terminal {
    private readonly terminal: XTerm;
    private readonly fitAddon: FitAddon;

    private resizeObserver?: ResizeObserver;

    constructor(container: HTMLDivElement) {
        this.terminal = new XTerm({
            cursorBlink: true,
            convertEol: true,
            fontFamily:
                '"JetBrains Mono","Cascadia Code","Fira Code",monospace',
            fontSize: 18,
            scrollback: 10000,

            allowProposedApi: false,
        });

        this.fitAddon = new FitAddon();

        this.terminal.loadAddon(this.fitAddon);
        this.terminal.loadAddon(new WebLinksAddon());

        this.terminal.open(container);

        this.updateTheme();

        this.terminal.attachCustomKeyEventHandler((event: KeyboardEvent) => {
            if (
                event.type === 'keydown' &&
                event.ctrlKey &&
                event.key.toLowerCase() === 'c'
            ) {
                const selection = this.terminal.getSelection();

                if (selection.length > 0) {
                    void navigator.clipboard.writeText(selection);

                    event.preventDefault();

                    return false;
                }
            }

            return true;
        });

        this.resizeObserver = new ResizeObserver(() => {
            this.fitAddon.fit();
        });

        this.resizeObserver.observe(container);

        this.fitAddon.fit();
    }

    updateTheme(): void {
        const isDark = document.documentElement.classList.contains('dark');

        this.terminal.options.theme = {
            background: isDark ? '#00000000' : '#ffffff',
            foreground: isDark ? '#ffffff' : '#000000',
        };
    }

    write(text: string): void {
        this.terminal.write(text);
    }

    writeln(text: string): void {
        this.terminal.writeln(text);
    }

    clear(): void {
        this.terminal.clear();
    }

    focus(): void {
        this.terminal.focus();
    }

    fit(): void {
        this.fitAddon.fit();
    }

    destroy(): void {
        this.resizeObserver?.disconnect();
        this.terminal.dispose();
    }
}
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
            fontSize: 14,
            scrollback: 10000,
        });

        this.fitAddon = new FitAddon();

        this.terminal.loadAddon(this.fitAddon);
        this.terminal.loadAddon(new WebLinksAddon());

        this.terminal.open(container);

        this.fitAddon.fit();

        this.resizeObserver = new ResizeObserver(() => {
            this.fitAddon.fit();
        });

        this.resizeObserver.observe(container);
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
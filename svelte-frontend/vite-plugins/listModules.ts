// svelte-frontend/vite-plugins/listModules.ts
import { writeFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';

interface Options {
    filename?: string;
}

export function listModules({
    filename = 'modules.txt',
}: Options = {}) {
    const modules = new Set<string>();

    let root: string;

    return {
        name: 'list-modules',
        enforce: 'post' as const,

        configResolved(config) {
            root = config.root;
        },

        transform(_, id: string) {
            // Skip virtual modules and non-code assets
            if (
                id[0] === '\0' ||
                id.includes('?') ||
                /\.(css|scss|sass|less|svg|png|jpg|jpeg|gif|webp|ico)$/i.test(id)
            ) {
                return null;
            }

            modules.add(relative(root, id).replaceAll('\\', '/'));

            return null;
        },

        closeBundle() {
            if (modules.size === 0) return;

            writeFileSync(
                resolve(filename),
                [...modules].sort().join('\n'),
                'utf8',
            );
        },
    };
}
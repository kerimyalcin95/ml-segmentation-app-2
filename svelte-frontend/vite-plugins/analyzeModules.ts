// svelte-frontend/vite-plugins/analyzeModules.ts

import { writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import type {
    ModuleInfo,
    NormalizedOutputOptions,
    OutputBundle,
    Plugin,
    ResolvedConfig,
} from 'vite';

interface Options {
    filename: string;
    graphFilename?: string;
    reverseGraphFilename?: string;
}

export function analyzeModules({
    filename,
    graphFilename = './analysis/modules_graph.json',
    reverseGraphFilename = './analysis/modules_graph_reverse.json',
}: Options): Plugin {
    const transformed = new Set<string>();

    // module -> imports
    const graph = new Map<string, string[]>();

    // module -> imported by
    const reverseGraph = new Map<string, string[]>();

    let root = '';

    const normalize = (id: string): string =>
        relative(root, id).replaceAll('\\', '/');

    return {
        name: 'analyze-modules',
        enforce: 'post',

        configResolved(config: ResolvedConfig) {
            root = config.root;
        },

        transform(_, id) {
            if (
                id.startsWith('\0') ||
                id.includes('?')
            ) {
                return null;
            }

            transformed.add(id);

            return null;
        },

        moduleParsed(info: ModuleInfo) {
            if (
                info.id.startsWith('\0') ||
                info.id.includes('?')
            ) {
                return;
            }

            const module = normalize(info.id);

            const imports = info.importedIds
                .filter(
                    (id) =>
                        !id.startsWith('\0') &&
                        !id.includes('?'),
                )
                .map(normalize);

            graph.set(module, imports);

            for (const imported of imports) {
                const importers =
                    reverseGraph.get(imported) ?? [];

                importers.push(module);

                reverseGraph.set(imported, importers);
            }

            if (!reverseGraph.has(module)) {
                reverseGraph.set(module, []);
            }
        },

        generateBundle(
            _: NormalizedOutputOptions,
            bundle: OutputBundle,
        ) {
            const bundled = new Set<string>();

            for (const output of Object.values(bundle)) {
                if (output.type !== 'chunk') {
                    continue;
                }

                for (const module of Object.keys(output.modules)) {
                    bundled.add(module);
                }
            }

            const unused = [...transformed]
                .filter((id) => !bundled.has(id))
                .map(normalize)
                .sort();

            writeFileSync(
                resolve(filename),
                unused.join('\n'),
                'utf8',
            );

            const normalizedGraph = Object.fromEntries(
                [...graph.entries()]
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([module, imports]) => [
                        module,
                        [...imports].sort(),
                    ]),
            );

            writeFileSync(
                resolve(graphFilename),
                JSON.stringify(normalizedGraph, null, 2),
                'utf8',
            );

            const normalizedReverseGraph = Object.fromEntries(
                [...reverseGraph.entries()]
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([module, importers]) => [
                        module,
                        [...new Set(importers)].sort(),
                    ]),
            );

            writeFileSync(
                resolve(reverseGraphFilename),
                JSON.stringify(normalizedReverseGraph, null, 2),
                'utf8',
            );
        },
    };
}
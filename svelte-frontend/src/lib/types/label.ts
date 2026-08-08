export interface ActiveLabel {
    id: number;
    name: string;
    color: string;

    visible: boolean;
    selected: boolean;
}

export function validateLabelFile(json: string): ActiveLabel[] {
    let data: unknown;

    try {
        data = JSON.parse(json);
    } catch {
        throw new Error('The selected file is not valid JSON.');
    }

    if (typeof data !== 'object' || data === null) {
        throw new Error('The root element must be an object.');
    }

    if (!('labels' in data)) {
        throw new Error("The file is missing the 'labels' property.");
    }

    const { labels } = data;

    if (!Array.isArray(labels)) {
        throw new Error("The 'labels' property must be an array.");
    }

    if (labels.length === 0) {
        throw new Error('The labels array is empty.');
    }

    const ids = new Set<number>();
    const colors = new Set<string>();

    let selectedCount = 0;

    const validatedLabels: ActiveLabel[] = [];

    for (const [index, label] of labels.entries()) {
        const labelNumber = String(index + 1);

        if (!isActiveLabel(label)) {
            throw new Error(`Label ${labelNumber} is invalid.`);
        }

        if (ids.has(label.id)) {
            throw new Error(`Duplicate label id: ${String(label.id)}.`);
        }

        ids.add(label.id);

        if (colors.has(label.color)) {
            throw new Error(`Duplicate label color: ${label.color}.`);
        }

        colors.add(label.color);

        if (label.selected) {
            selectedCount++;
        }

        validatedLabels.push(label);
    }

    if (selectedCount > 1) {
        throw new Error('More than one label is selected.');
    }

    return validatedLabels;
}

function isActiveLabel(value: unknown): value is ActiveLabel {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const label = value as Partial<ActiveLabel>;

    return (
        Number.isInteger(label.id) &&
        typeof label.name === 'string' &&
        label.name.trim() !== '' &&
        typeof label.color === 'string' &&
        label.color.trim() !== '' &&
        typeof label.visible === 'boolean' &&
        typeof label.selected === 'boolean'
    );
}
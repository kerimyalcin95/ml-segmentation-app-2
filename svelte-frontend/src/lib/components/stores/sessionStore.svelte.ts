import { type Mode } from '$lib/types/mode';
import { type ActiveLabel } from '$lib/types/label';
import { type ActiveFilter } from '$lib/types/filter';

class EditingSession {
    activeFilters = $state<ActiveFilter[]>([]);
    selectedFilterId = $state<number | null>(null);
    saveDirectory = $state<string>();
    loadDirectory = $state<string>();
}

class LabelingSession {
    enabled = $state(false);
    brushSize = $state(32);
    globalOpacity = $state(50);
    globalHidden = $state(false);
    activeLabels = $state<ActiveLabel[]>([]);
    labelSaveDirectory = $state<string>();
    labelLoadDirectory = $state<string>();
    labelImageSaveDirectory = $state<string>();
    labelImageLoadDirectory = $state<string>();
}

class SessionStore {
    mode = $state<Mode>('editing');

    hasLabelImage = $state(false);
    hasImage = $state(false);

    editing = new EditingSession();
    labeling = new LabelingSession();
}

export const sessionStore = new SessionStore();
import {type Mode} from '$lib/types/mode';
import { type ActiveLabel } from '$lib/types/label';

class LabelingSession {
    enabled = $state(false);
    brushSize = $state(32);
    globalOpacity = $state(50);
    globalHidden = $state(false);
}

class SessionStore {
    lastDirectory = $state<string>();
    mode = $state<Mode>("editing");
    activeLabels = $state<ActiveLabel[]>([]);

    labeling = new LabelingSession();
}

export const sessionStore = new SessionStore();
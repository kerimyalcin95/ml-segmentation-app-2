import {type Mode} from '$lib/types/mode';
import { type ActiveLabel } from '$lib/types/label';

class SessionStore {
    lastDirectory = $state<string>();
    mode = $state<Mode>('editing');
    activeLabels = $state<ActiveLabel[]>([]);
    labelsEnabled = $state(false);
    brushSize = $state(32);
}

export const sessionStore = new SessionStore();
import {type Mode} from '$lib/types/mode';
import { type ActiveLabel } from '$lib/types/label';

class SessionStore {
    lastDirectory = $state<string>();
    mode = $state<Mode>('editing');
    activeLabels = $state<ActiveLabel[]>([]);
    labelsEnabled = $state(false);
}

export const sessionStore = new SessionStore();
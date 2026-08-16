import { type Mode } from '$lib/types/mode';
import { type ActiveLabel } from '$lib/types/label';
import { type ActiveFilter } from '$lib/types/filter';
import { type fastaiArch } from '$lib/types/training';

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

class TrainingSession {
    imagePath = $state('');
    labelImagePath = $state('');
    labelPath = $state('');
    modelPath = $state('');
    modelName = $state('');

    configured = $derived(
        !!this.imagePath &&
        !!this.labelImagePath &&
        !!this.labelPath &&
        !!this.modelPath
    );

    batchSize = $state(8);
    numWorkers = $state(0);
    epochs = $state(6);

    validationPercent = $state(20);
    seed = $state<number | undefined>(undefined);

    architecture = $state<fastaiArch>('resnet34');
    pretrained = $state(true);

    trainExistingModel = $state(false);

    running = $state(false);
}

class SessionStore {
    mode = $state<Mode>('editing');

    hasLabelImage = $state(false);
    hasImage = $state(false);

    editing = new EditingSession();
    labeling = new LabelingSession();
    training = new TrainingSession();

    toJSON(): PersistedSession {
        return {
            editing: {
                saveDirectory: this.editing.saveDirectory,
                loadDirectory: this.editing.loadDirectory,
            },

            labeling: {
                labelSaveDirectory:
                    this.labeling.labelSaveDirectory,
                labelLoadDirectory:
                    this.labeling.labelLoadDirectory,
                labelImageSaveDirectory:
                    this.labeling.labelImageSaveDirectory,
                labelImageLoadDirectory:
                    this.labeling.labelImageLoadDirectory,
            },

            training: {
                imagePath: this.training.imagePath,
                labelImagePath: this.training.labelImagePath,
                labelPath: this.training.labelPath,
                modelPath: this.training.modelPath,
                batchSize: this.training.batchSize,
                numWorkers: this.training.numWorkers,
                epochs: this.training.epochs,
                validationPercent:
                    this.training.validationPercent,
                seed: this.training.seed,
                architecture: this.training.architecture,
                pretrained: this.training.pretrained,
                trainExistingModel:
                    this.training.trainExistingModel,
            },
        };
    }

    loadJSON(data: PersistedSession): void {
        const editing = data.editing;

        if (editing?.saveDirectory) {
            this.editing.saveDirectory =
                editing.saveDirectory;
        }

        if (editing?.loadDirectory) {
            this.editing.loadDirectory =
                editing.loadDirectory;
        }

        const labeling = data.labeling;

        if (labeling?.labelSaveDirectory) {
            this.labeling.labelSaveDirectory =
                labeling.labelSaveDirectory;
        }

        if (labeling?.labelLoadDirectory) {
            this.labeling.labelLoadDirectory =
                labeling.labelLoadDirectory;
        }

        if (labeling?.labelImageSaveDirectory) {
            this.labeling.labelImageSaveDirectory =
                labeling.labelImageSaveDirectory;
        }

        if (labeling?.labelImageLoadDirectory) {
            this.labeling.labelImageLoadDirectory =
                labeling.labelImageLoadDirectory;
        }

        const training = data.training;

        if (training?.imagePath) {
            this.training.imagePath =
                training.imagePath;
        }

        if (training?.labelImagePath) {
            this.training.labelImagePath =
                training.labelImagePath;
        }

        if (training?.labelPath) {
            this.training.labelPath =
                training.labelPath;
        }

        if (training?.modelPath) {
            this.training.modelPath =
                training.modelPath;
        }

        if (training?.batchSize !== undefined) {
            this.training.batchSize =
                training.batchSize;
        }

        if (training?.numWorkers !== undefined) {
            this.training.numWorkers =
                training.numWorkers;
        }

        if (training?.epochs !== undefined) {
            this.training.epochs =
                training.epochs;
        }

        if (training?.validationPercent !== undefined) {
            this.training.validationPercent =
                training.validationPercent;
        }

        if (training?.seed !== undefined) {
            this.training.seed =
                training.seed;
        }

        if (training?.architecture) {
            this.training.architecture =
                training.architecture;
        }

        if (training?.pretrained !== undefined) {
            this.training.pretrained =
                training.pretrained;
        }

        if (training?.trainExistingModel !== undefined) {
            this.training.trainExistingModel =
                training.trainExistingModel;
        }
    }
}

export interface PersistedSession {
    editing?: {
        saveDirectory?: string;
        loadDirectory?: string;
    };

    labeling?: {
        labelSaveDirectory?: string;
        labelLoadDirectory?: string;
        labelImageSaveDirectory?: string;
        labelImageLoadDirectory?: string;
    };

    training?: {
        imagePath?: string;
        labelImagePath?: string;
        labelPath?: string;
        modelPath?: string;
        batchSize?: number;
        numWorkers?: number;
        epochs?: number;
        validationPercent?: number;
        seed?: number;
        architecture?: fastaiArch;
        pretrained?: boolean;
        trainExistingModel?: boolean;
    };
}

export const sessionStore = new SessionStore();
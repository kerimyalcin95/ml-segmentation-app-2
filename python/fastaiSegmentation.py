import json
from threading import Event

import numpy as np
import fastai.vision.all as fastai_vision


class TrainingCancelled(Exception):
    """Raised when training cancellation is requested."""

    def __init__(self):
        super().__init__("Training cancellation requested.")


class CancelTrainingCallback(fastai_vision.Callback):
    """Stop training when cancellation is requested."""

    def __init__(self, cancel_event: Event):
        self.cancel_event = cancel_event

    def before_batch(self):
        if self.cancel_event.is_set():
            raise TrainingCancelled()


class FastaiSegmentation:
    """Fastai-based image segmentation training and inference."""

    def __init__(
        self,
        image_path="./image",
        label_image_path="./label",
        label_path="./labels.json",
        model_path="model/resnet34_224x224.pkl",
        batch_size=8,
        num_workers=0,
        epochs=6,
        validationPercent=10,
        seed=None,
        architecture="resnet34",
        pretrained=True,
        cancel_event=None,
    ):
        self.image_path = fastai_vision.Path(image_path)
        self.label_image_path = fastai_vision.Path(label_image_path)
        self.label_path = fastai_vision.Path(label_path)
        self.model_path = fastai_vision.Path(model_path)

        self.batch_size = batch_size
        self.num_workers = num_workers
        self.epochs = epochs

        self.validationPercent = validationPercent
        self.seed = seed
        self.architecture = architecture
        self.pretrained = pretrained

        self.cancel_event = cancel_event

        self.learner = None

    def _create_dataloaders(self):
        """Create the fastai segmentation dataloaders."""
        codes = self._create_codes()

        image_files = fastai_vision.get_image_files(
            self.image_path
        )

        label_image_path = self.label_image_path

        def label_func(filename):
            return (
                label_image_path
                / f"{filename.stem}{filename.suffix}"
            )

        fastai_vision.PILMask._open_args = {
            "mode": "P",
        }

        validation_percent = max(
            0,
            min(100, self.validationPercent),
        )

        dataloaders = (
            fastai_vision.SegmentationDataLoaders.from_label_func(
                self.image_path,
                bs=self.batch_size,
                fnames=image_files,
                label_func=label_func,
                valid_pct=validation_percent / 100,
                seed=self.seed,
                codes=codes,
                num_workers=self.num_workers,
            )
        )

        return dataloaders

    def _create_learner(self):
        """Create the fastai U-Net learner."""
        dataloaders = self._create_dataloaders()

        architectures = {
            "resnet18": fastai_vision.resnet18,
            "resnet34": fastai_vision.resnet34,
            "resnet50": fastai_vision.resnet50,
            "resnet101": fastai_vision.resnet101,
            "resnet152": fastai_vision.resnet152,
        }

        try:
            architecture = architectures[self.architecture]
        except KeyError as error:
            raise ValueError(
                f"Unsupported architecture: "
                f"{self.architecture}"
            ) from error

        self.learner = fastai_vision.unet_learner(
            dataloaders,
            architecture,
            pretrained=self.pretrained,
        )

        return self.learner

    def train(self):
        """Train the segmentation model and save it."""

        print("fastai: Model Training Start.")
        print("")

        self._create_learner()

        callbacks = []

        if self.cancel_event is not None:
            callbacks.append(
                CancelTrainingCallback(
                    self.cancel_event
                )
            )

        try:
            self.learner.fine_tune(
                self.epochs,
                cbs=callbacks,
            )

        except TrainingCancelled:
            print("")
            print("fastai: Training Cancelled.")
            print("")

            return self.learner

        print("")
        print("fastai: Saving model.")

        fastai_vision.save_model(
            file=self.model_path,
            model=self.learner,
            with_opt=False,
            opt=None,
        )

        print("fastai: Training Finish.")
        print("")

        return self.learner

    def load(self):
        """Create the learner and load the trained model."""
        self._create_learner()

        fastai_vision.load_model(
            self.model_path,
            self.learner,
            opt=None,
        )

        return self.learner

    def predict(self, image):
        """Predict a segmentation mask for an image."""
        if self.learner is None:
            self.load()

        prediction = self.learner.predict(image)[0]

        mask = np.array(prediction).astype(np.uint8)

        mask[mask == 1] = 255

        return mask

    def _create_codes(self):
        """Create fastai class codes from the labels JSON file."""
        with self.label_path.open(
            "r",
            encoding="utf-8",
        ) as file:
            data = json.load(file)

        return np.array(
            ["Background"] +
            [
                label["name"]
                for label in data["labels"]
            ],
            dtype=str,
        )
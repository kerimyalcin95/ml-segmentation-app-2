import fastai.vision.all as fastai_vision

from .base import (
    FastaiSegmentationBase,
    SegmentationCancelled,
)


class FastaiSegmentationTraining(FastaiSegmentationBase):
    """Fastai-based semantic segmentation training."""

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
        super().__init__(
            model_path=model_path,
            cancel_event=cancel_event,
        )

        self.image_path = fastai_vision.Path(
            image_path
        )
        self.label_image_path = fastai_vision.Path(
            label_image_path
        )

        self.label_path = fastai_vision.Path(
            label_path
        )

        self.batch_size = batch_size
        self.num_workers = num_workers
        self.epochs = epochs
        self.validationPercent = validationPercent
        self.seed = seed
        self.architecture = architecture
        self.pretrained = pretrained

    def _create_dataloaders(self):
        """Create the fastai segmentation dataloaders."""
        labels = self._load_labels(
            self.label_path
        )

        codes = self._create_codes(
            labels
        )

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

        return (
            fastai_vision.SegmentationDataLoaders
            .from_label_func(
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
            architecture = architectures[
                self.architecture
            ]
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

    def _store_model_config(self):
        """Store model configuration inside the learner."""
        labels = self._load_labels(
            self.label_path
        )

        colors = self._create_label_colors(
            labels
        )

        self._set_model_config(
            {
                "architecture": self.architecture,
                "codes": self._create_codes(
                    labels
                ),
                "labels": labels,
                "colors": colors,
                "palette": self._create_palette(
                    colors
                ),
                "batch_size": self.batch_size,
                "num_workers": self.num_workers,
                "epochs": self.epochs,
                "validationPercent": (
                    self.validationPercent
                ),
                "seed": self.seed,
                "pretrained": self.pretrained,
            }
        )

    def train(self):
        """Train the segmentation model and save it."""
        print("fastai: Model Training Start.")
        print("")

        self._create_learner()
        self._store_model_config()

        callbacks = []

        cancel_callback = self._create_cancel_callback()

        if cancel_callback is not None:
            callbacks.append(
                cancel_callback
            )

        try:
            self.learner.fine_tune(
                self.epochs,
                cbs=callbacks,
            )

        except SegmentationCancelled:
            print("")
            print("fastai: Training Cancelled.")
            print("")

            return self.learner

        print("")
        print("fastai: Saving model.")

        self._save_model()

        print("fastai: Training Finish.")
        print("")

        return self.learner
import json
import numpy as np
import fastai.vision.all as fastai_vision


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
    ):
        self.image_path = fastai_vision.Path(image_path)
        self.label_image_path = fastai_vision.Path(label_image_path)
        self.label_path = fastai_vision.Path(label_path)
        self.model_path = fastai_vision.Path(model_path)
        self.batch_size = batch_size
        self.num_workers = num_workers
        self.epochs = epochs

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

        dataloaders = (
            fastai_vision.SegmentationDataLoaders.from_label_func(
                self.image_path,
                bs=self.batch_size,
                fnames=image_files,
                label_func=label_func,
                codes=codes,
                num_workers=self.num_workers,
            )
        )

        return dataloaders

    def _create_learner(self):
        """Create the fastai U-Net learner."""
        dataloaders = self._create_dataloaders()

        self.learner = fastai_vision.unet_learner(
            dataloaders,
            fastai_vision.resnet34,
        )

        return self.learner

    def train(self):
        """Train the segmentation model and save it."""
        self._create_learner()

        self.learner.fine_tune(
            self.epochs
        )

        fastai_vision.save_model(
            file=self.model_path,
            model=self.learner,
            with_opt=False,
            opt=None,
        )

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

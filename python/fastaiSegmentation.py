import numpy as np
import fastai.vision.all as fastai_vision


class FastaiSegmentation:
    """Fastai-based image segmentation training and inference."""

    def __init__(
        self,
        dataset_path=".",
        model_path="model/resnet32_336x336_defaultMaterial.pkl",
        batch_size=8,
        num_workers=0,
    ):
        self.dataset_path = fastai_vision.Path(dataset_path)
        self.model_path = fastai_vision.Path(model_path)
        self.batch_size = batch_size
        self.num_workers = num_workers

        self.learner = None

    def _label_func(self, filename):
        """Return the segmentation mask path for an image."""
        return (
            self.dataset_path
            / "label"
            / f"{filename.stem}{filename.suffix}"
        )

    def _create_dataloaders(self):
        """Create the fastai segmentation dataloaders."""
        codes = np.loadtxt(
            self.dataset_path / "codes.txt",
            dtype=str,
        )

        image_files = fastai_vision.get_image_files(
            self.dataset_path / "image"
        )

        return fastai_vision.SegmentationDataLoaders.from_label_func(
            self.dataset_path,
            bs=self.batch_size,
            fnames=image_files,
            label_func=self._label_func,
            codes=codes,
            num_workers=self.num_workers,
        )

    def _create_learner(self):
        """Create the fastai U-Net learner."""
        dataloaders = self._create_dataloaders()

        self.learner = fastai_vision.unet_learner(
            dataloaders,
            fastai_vision.resnet34,
        )

        return self.learner

    def train(self, epochs=6):
        """Train the segmentation model and save it."""
        self._create_learner()

        self.learner.fine_tune(epochs)

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
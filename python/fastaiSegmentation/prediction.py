from pathlib import Path

import numpy as np
from PIL import Image
import fastai.vision.all as fastai_vision

from .base import (
    FastaiSegmentationBase,
    SegmentationCancelled,
)


class FastaiSegmentationPrediction(FastaiSegmentationBase):
    """Fastai-based semantic segmentation prediction."""

    def __init__(
        self,
        image_path,
        label_image_path,
        model_path,
        cancel_event=None,
    ):
        super().__init__(
            model_path=model_path,
            cancel_event=cancel_event,
        )

        self.image_path = Path(image_path)
        self.label_image_path = Path(
            label_image_path
        )

    def _save_prediction(self, prediction):
        """Save the predicted segmentation as a paletted PNG."""
        config = self._get_model_config()

        mask = np.asarray(
            prediction,
            dtype=np.uint8,
        )

        label_image = Image.fromarray(
            mask,
            mode="P",
        )

        palette = config["palette"]

        label_image.putpalette(
            palette
        )

        highest_label_index = int(
            mask.max()
        )

        transparency = bytes(
            [255] * (highest_label_index + 1)
        )

        self.label_image_path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        label_image.save(
            self.label_image_path,
            format="PNG",
            transparency=transparency,
        )

    def predict(self):
        """Predict the input image and save the label image."""
        print("fastai: Model Prediction Start.")
        print("")

        try:
            self._load_model()

            cancel_callback = (
                self._create_cancel_callback()
            )

            if cancel_callback is not None:
                self.learner.add_cb(
                    cancel_callback
                )

            prediction = self.learner.predict(
                fastai_vision.PILImage.create(
                    self.image_path
                )
            )[0]

            self._save_prediction(
                prediction
            )

            print(
                "fastai: Prediction Finish."
            )
            print("")

            return prediction

        except SegmentationCancelled:
            print("")
            print("fastai: Prediction Cancelled.")
            print("")

            return None
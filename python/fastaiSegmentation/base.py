import json
from pathlib import Path
from threading import Event

import fastai.vision.all as fastai_vision


class SegmentationCancelled(Exception):
    """Raised when segmentation cancellation is requested."""

    def __init__(self):
        super().__init__("Segmentation cancellation requested.")


class CancelSegmentationCallback(fastai_vision.Callback):
    """Stop segmentation when cancellation is requested."""

    def __init__(self, cancel_event: Event):
        self.cancel_event = cancel_event

    def before_batch(self):
        if self.cancel_event.is_set():
            raise SegmentationCancelled()


class FastaiSegmentationBase:
    """Shared functionality for fastai segmentation operations."""

    def __init__(
        self,
        model_path="model/resnet34_224x224.pkl",
        cancel_event=None,
    ):
        self.model_path = Path(model_path)
        self.cancel_event = cancel_event

        self.learner = None

    def _create_cancel_callback(self):
        """Create a cancellation callback when cancellation is enabled."""
        if self.cancel_event is None:
            return None

        return CancelSegmentationCallback(
            self.cancel_event
        )

    def _load_labels(self, label_path):
        """Load label definitions from the labels JSON file."""
        label_path = Path(label_path)

        with label_path.open(
            "r",
            encoding="utf-8",
        ) as file:
            data = json.load(file)

        labels = data["labels"]

        if not isinstance(labels, list):
            raise ValueError(
                "The labels property must be a list."
            )

        return labels

    def _create_codes(self, labels):
        """Create fastai class codes from label definitions."""
        return [
            "Background",
            *[
                label["name"]
                for label in labels
            ],
        ]

    def _create_label_colors(self, labels):
        """Create RGB colors from label definitions."""
        colors = [
            (0, 0, 0),
        ]

        for label in labels:
            color = label.get("color")

            if not isinstance(color, str):
                raise ValueError(
                    f"Label '{label['name']}' "
                    "has no valid color."
                )

            color = color.lstrip("#")

            if len(color) != 6:
                raise ValueError(
                    f"Invalid color '{color}' "
                    f"for label '{label['name']}'."
                )

            try:
                colors.append(
                    (
                        int(color[0:2], 16),
                        int(color[2:4], 16),
                        int(color[4:6], 16),
                    )
                )
            except ValueError as error:
                raise ValueError(
                    f"Invalid color '{color}' "
                    f"for label '{label['name']}'."
                ) from error

        if len(colors) > 256:
            raise ValueError(
                "A paletted PNG supports a maximum "
                "of 256 label colors."
            )

        return colors

    def _create_palette(self, colors):
        """Create a PIL-compatible flat color palette."""
        palette = []

        for red, green, blue in colors:
            palette.extend(
                [red, green, blue]
            )

        palette.extend(
            [0] * (256 * 3 - len(palette))
        )

        return palette

    def _set_model_config(self, config):
        """Store application configuration inside the learner."""
        if self.learner is None:
            raise RuntimeError(
                "The learner must be created before "
                "setting the model configuration."
            )

        self.learner.segmentation_config = config

    def _get_model_config(self):
        """Get application configuration stored in the learner."""
        if self.learner is None:
            raise RuntimeError(
                "The learner must be loaded before "
                "reading the model configuration."
            )

        config = getattr(
            self.learner,
            "segmentation_config",
            None,
        )

        if config is None:
            raise ValueError(
                "The model does not contain segmentation "
                "configuration."
            )

        return config

    def _save_model(self):
        """Export the complete learner and model configuration."""
        if self.learner is None:
            raise RuntimeError(
                "The learner must be created before "
                "saving the model."
            )

        self.model_path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        self.learner.export(
            self.model_path
        )

    def _load_model(self):
        """Load the complete learner and model configuration."""
        self.learner = fastai_vision.load_learner(
            self.model_path,
        )

        return self.learner
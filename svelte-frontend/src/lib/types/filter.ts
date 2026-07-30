export type Filter = {
    id: number;
    name: string;
    value: number;
};

export enum FilterType {
    Blur,
    Brighten,
    Contrast,
    Enhance,
    Grayscale,
    HSL,
    Invert,
    Mask,
    Noise,
    Pixelate,
    Posterize,
    RGB,
    Sepia,
    Solarize,
    Threshold,
}

export interface BaseFilterState {
    type: FilterType;

    opacity: number;

    blendMode: GlobalCompositeOperation;
}

export interface BlurFilterState extends BaseFilterState {
    type: FilterType.Blur;
    blurRadius: number;
}

export interface BrightenFilterState extends BaseFilterState {
    type: FilterType.Brighten;
    brightness: number;
}

export interface ContrastFilterState extends BaseFilterState {
    type: FilterType.Contrast;
    contrast: number;
}

export interface EnhanceFilterState extends BaseFilterState {
    type: FilterType.Enhance;
    enhance: number;
}

export interface GrayscaleFilterState extends BaseFilterState {
    type: FilterType.Grayscale;
}

export interface HSLFilterState extends BaseFilterState {
    type: FilterType.HSL;
    hue: number;
    saturation: number;
    luminance: number;
}

export interface InvertFilterState extends BaseFilterState {
    type: FilterType.Invert;
}

export interface MaskFilterState extends BaseFilterState {
    type: FilterType.Mask;
    threshold: number;
}

export interface NoiseFilterState extends BaseFilterState {
    type: FilterType.Noise;
    noise: number;
}

export interface PixelateFilterState extends BaseFilterState {
    type: FilterType.Pixelate;
    pixelSize: number;
}

export interface PosterizeFilterState extends BaseFilterState {
    type: FilterType.Posterize;
    levels: number;
}

export interface RGBFilterState extends BaseFilterState {
    type: FilterType.RGB;
    red: number;
    green: number;
    blue: number;
}

export interface SepiaFilterState extends BaseFilterState {
    type: FilterType.Sepia;
}

export interface SolarizeFilterState extends BaseFilterState {
    type: FilterType.Solarize;
}

export interface ThresholdFilterState extends BaseFilterState {
    type: FilterType.Threshold;
    threshold: number;
}

export type FilterState =
    | BlurFilterState
    | BrightenFilterState
    | ContrastFilterState
    | EnhanceFilterState
    | GrayscaleFilterState
    | HSLFilterState
    | InvertFilterState
    | MaskFilterState
    | NoiseFilterState
    | PixelateFilterState
    | PosterizeFilterState
    | RGBFilterState
    | SepiaFilterState
    | SolarizeFilterState
    | ThresholdFilterState;
"use client";

import {
    useCallback,
    useRef,
    useState
} from "react";
import type { Crop } from "react-image-crop";
import ReactCrop, {
    centerCrop,
    makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const ASPECT_RATIOS = {
    "1:1": 1,
    "16:9": 16 / 9,
    "3:4": 3 / 4,
};

type AspectRatioKey = keyof typeof ASPECT_RATIOS;

export type ImageCropperModalProps = {
    isOpen: boolean;
    onClose: () => void;
    imageSrc: string;
    fileName: string;
    availableRatios?: AspectRatioKey[];
    defaultRatio?: AspectRatioKey;
    onImageCropped: (file: File, previewUrl: string) => void;
    buttonText?: {
        select?: string;
        cancel?: string;
    };
    title?: string;
    description?: string;
};

export function ImageCropperModal({
    isOpen,
    onClose,
    imageSrc,
    fileName,
    availableRatios = ["1:1", "16:9", "3:4"],
    defaultRatio = "16:9",
    onImageCropped,
    buttonText = {
        select: "Select",
        cancel: "Cancel",
    },
    title = "Crop Image",
    description = "Adjust the crop area to select the part of the image you want to use.",
}: ImageCropperModalProps) {
    const imgRef = useRef<HTMLImageElement>(null);
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<Crop>();
    const [aspectRatio, setAspectRatio] = useState<AspectRatioKey>(defaultRatio);
    const [error, setError] = useState<string | null>(null);

    const onImageLoad = useCallback(
        (e: React.SyntheticEvent<HTMLImageElement>) => {
            const { width, height } = e.currentTarget;
            const cropAspect = ASPECT_RATIOS[aspectRatio];

            const initialCrop = centerCrop(
                makeAspectCrop(
                    {
                        unit: "%",
                        width: 90,
                    },
                    cropAspect,
                    width,
                    height,
                ),
                width,
                height,
            );

            setCrop(initialCrop);
            setCompletedCrop(initialCrop);
            return false;
        },
        [aspectRatio],
    );

    const handleAspectRatioChange = (value: AspectRatioKey) => {
        setAspectRatio(value);

        if (imgRef.current) {
            const { width, height } = imgRef.current;
            const cropAspect = ASPECT_RATIOS[value];

            const newCrop = centerCrop(
                makeAspectCrop(
                    {
                        unit: "%",
                        width: 90,
                    },
                    cropAspect,
                    width,
                    height,
                ),
                width,
                height,
            );

            setCrop(newCrop);
            setCompletedCrop(newCrop);
        }
    };

    const handleSelect = useCallback(() => {
        if (completedCrop && imgRef.current) {
            const canvas = document.createElement("canvas");
            const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
            const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
            const ctx = canvas.getContext("2d");

            if (!ctx) {
                setError("Failed to create canvas context");
                return;
            }

            const pixelRatio = window.devicePixelRatio || 1;

            canvas.width = completedCrop.width * scaleX * pixelRatio;
            canvas.height = completedCrop.height * scaleY * pixelRatio;

            ctx.scale(pixelRatio, pixelRatio);
            ctx.imageSmoothingQuality = "high";

            const cropX = completedCrop.x * scaleX;
            const cropY = completedCrop.y * scaleY;
            const cropWidth = completedCrop.width * scaleX;
            const cropHeight = completedCrop.height * scaleY;

            ctx.drawImage(
                imgRef.current,
                cropX,
                cropY,
                cropWidth,
                cropHeight,
                0,
                0,
                cropWidth,
                cropHeight,
            );

            const base64Image = canvas.toDataURL("image/webp", 0.9);

            fetch(base64Image)
                .then((res) => res.blob())
                .then((blob) => {
                    const newFileName = `${fileName.split(".")[0]
                        }-cropped-${aspectRatio.replace(":", "x")}.webp`;
                    const fileType = "image/webp";
                    const file = new File([blob], newFileName, {
                        type: fileType,
                    });

                    onImageCropped(file, base64Image);
                    onClose();
                })
                .catch((err) => {
                    setError("Error preparing image for upload");
                    console.error(err);
                });
        } else {
            setError("Please select an area to crop first");
        }
    }, [completedCrop, imgRef, fileName, aspectRatio, onImageCropped, onClose]);

    const showAspectRatioTabs = availableRatios.length > 1;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[90vh] max-w-lg overflow-hidden">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && (
                        <DialogDescription>{description}</DialogDescription>
                    )}
                </DialogHeader>

                <div className="flex max-h-[calc(90vh-60px)] flex-col gap-4 overflow-auto pt-2">
                    {showAspectRatioTabs && (
                        <div
                            className="inline-flex w-full items-center justify-start gap-1 rounded-md bg-muted p-1"
                            role="group"
                        >
                            {availableRatios.map((ratio) => (
                                <Button
                                    key={ratio}
                                    type="button"
                                    size="sm"
                                    variant={ratio === aspectRatio ? "default" : "ghost"}
                                    className={cn(
                                        "flex-1",
                                        ratio === aspectRatio && "shadow-sm",
                                    )}
                                    onClick={() => handleAspectRatioChange(ratio)}
                                >
                                    {ratio}
                                </Button>
                            ))}
                        </div>
                    )}

                    <div className="rounded-md border bg-muted p-2">
                        <ReactCrop
                            crop={crop}
                            onChange={(c) => setCrop(c)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={ASPECT_RATIOS[aspectRatio]}
                            className="mx-auto max-h-[500px]"
                        >
                            <img
                                ref={imgRef}
                                src={imageSrc || "/placeholder.svg"}
                                alt="Upload"
                                onLoad={onImageLoad}
                                className="mx-auto block max-h-[500px] max-w-full"
                            />
                        </ReactCrop>
                    </div>

                    {error && (
                        <Alert variant="destructive" className="mt-1">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-9 w-fit"
                            onClick={onClose}
                        >
                            {buttonText.cancel}
                        </Button>
                        <Button
                            type="button"
                            variant="default"
                            className="h-9 w-fit"
                            onClick={handleSelect}
                        >
                            {buttonText.select}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

import type { ReactNode } from "react";
import React, { useEffect, useRef, useState } from "react";

import { Camera } from "lucide-react"; // lucide icon [web:6][web:15]

// shadcn/ui
import { Button } from "@/components/ui/button"; // [web:2]
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { ImageCropperModal } from "./ImageCropperModal";

type AspectRatioKey = "1:1" | "16:9" | "3:4";

export type ImageCropperProps = {
    /** Variant determines the default aspect ratio and styling */
    variant?: "profile" | "post" | "banner" | "custom";
    /** Optional custom input component to replace the default upload button */
    customInput?: ReactNode;
    /** Optional title for the component */
    title?: string;
    /** Optional description text */
    description?: string;
    /** Available aspect ratios (defaults to all) */
    availableRatios?: AspectRatioKey[];
    /** Default aspect ratio */
    defaultRatio?: AspectRatioKey;
    /** Callback when image is selected and cropped */
    onImageCropped?: (file: File) => void;
    /** Custom class name for the container */
    className?: string;
    /** Custom button text */
    buttonText?: {
        select?: string;
        upload?: string;
        chooseImage?: string;
        cancel?: string;
    };
    previewImgUrl?: string | null;
};

export function ImageCropper({
    variant = "custom",
    customInput,
    title,
    description,
    availableRatios = ["1:1", "16:9", "3:4"],
    defaultRatio,
    onImageCropped,
    className = "",
    buttonText = {
        select: "Select",
        upload: "Upload",
        chooseImage: "Choose Image",
        cancel: "Cancel",
    },
    previewImgUrl = null,
}: ImageCropperProps) {
    // Set default ratio based on variant
    const initialRatio =
        defaultRatio ||
        (variant === "profile" ? "1:1" : variant === "banner" ? "16:9" : "1:1");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imgSrc, setImgSrc] = useState<string>("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(previewImgUrl);
    const [originalFileName, setOriginalFileName] = useState<string>("image");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // file selection
    const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const fileName = file.name;
            setOriginalFileName(fileName);

            const reader = new FileReader();
            reader.addEventListener("load", () => {
                const result = reader.result?.toString() || "";
                setImgSrc(result);
                setIsModalOpen(true);

                if (inputRef.current) {
                    inputRef.current.value = "";
                }
            });
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        inputRef.current?.click();
    };

    const handleCroppedImage = (file: File, preview: string) => {
        setPreviewUrl(preview);
        setSelectedFile(file);

        if (onImageCropped) {
            onImageCropped(file);
        }
    };

    const handleUpload = () => {
        if (selectedFile) {
            // do upload here
        }
    };

    useEffect(() => {
        setPreviewUrl(previewImgUrl);
    }, [previewImgUrl]);

    const renderPreview = () => {
        if (!previewUrl) return null;

        if (variant === "profile") {
            return (
                <div className="mt-4 flex flex-col items-center space-y-4">
                    <div
                        className="h-40 w-40 cursor-pointer rounded-full border-2 border-muted-foreground/30 bg-cover bg-center"
                        style={{ backgroundImage: `url(${previewUrl})` }}
                        onClick={triggerFileInput}
                        title="Click to change image"
                    />
                    <Button onClick={handleUpload} size="sm">
                        {buttonText.upload}
                    </Button>
                </div>
            );
        }

        return (
            <div className="h-full w-full">
                <Card
                    className="flex h-full w-full cursor-pointer items-center justify-center bg-muted"
                    onClick={triggerFileInput}
                    title="Click to change image"
                >
                    <img
                        src={previewUrl || "/placeholder.svg"}
                        alt="Preview"
                        className="h-full w-full max-w-full object-contain"
                    />
                </Card>
            </div>
        );
    };

    const containerClasses =
        variant === "profile" ? "mx-auto max-w-md" : "h-full w-full";

    return (
        <div className={cn(containerClasses, className)}>
            <div className="flex h-full w-full flex-col space-y-2">
                {title && (
                    <h2 className="text-lg font-semibold leading-none tracking-tight">
                        {title}
                    </h2>
                )}
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}

                <div className="flex h-full w-full flex-col space-y-4">
                    {/* Trigger (only if no preview) */}
                    {!previewUrl &&
                        (customInput ? (
                            <div
                                onClick={triggerFileInput}
                                className="flex h-full w-full cursor-pointer items-center"
                            >
                                {customInput}
                            </div>
                        ) : (
                            <Button
                                variant={variant === "profile" ? "default" : "outline"}
                                onClick={triggerFileInput}
                                className="w-full"
                            >
                                <Camera className="mr-2 h-4 w-4" /> {buttonText.chooseImage}
                            </Button>
                        ))}

                    {/* Hidden file input */}
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        onChange={onSelectFile}
                        className="hidden"
                    />

                    {/* Preview */}
                    {renderPreview()}

                    {/* Cropper Modal */}
                    <ImageCropperModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        imageSrc={imgSrc}
                        fileName={originalFileName}
                        availableRatios={availableRatios}
                        defaultRatio={initialRatio}
                        onImageCropped={handleCroppedImage}
                        buttonText={{
                            select: buttonText.select,
                            cancel: buttonText.cancel,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

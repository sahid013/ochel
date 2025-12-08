import { useState, useId } from 'react';

interface ImageUploaderProps {
    images: (File | string | null)[];
    onImagesChange: (images: (File | string | null)[]) => void;
    maxImages?: number;
    labels?: string[];
    loadingText: string;
    placeholderText?: string;
    className?: string;
    aspectRatio?: string;
    instanceId?: string;
}

export function ImageUploader({
    images,
    onImagesChange,
    maxImages = 4,
    labels,
    loadingText,
    placeholderText,
    className = '',
    aspectRatio,
    instanceId,
}: ImageUploaderProps) {
    const [loadingImages, setLoadingImages] = useState<boolean[]>(new Array(maxImages).fill(false));
    const ratioClass = aspectRatio || (maxImages === 1 ? 'aspect-video' : 'aspect-square');
    const autoId = useId();
    const uniqueIdBase = instanceId || autoId;

    const handleFileChange = (index: number, file: File) => {
        // Set loading state
        const newLoading = [...loadingImages];
        newLoading[index] = true;
        setLoadingImages(newLoading);

        // Simulate upload delay
        setTimeout(() => {
            const newImages = [...images];
            newImages[index] = file;
            onImagesChange(newImages);

            const doneLoading = [...newLoading];
            doneLoading[index] = false;
            setLoadingImages(doneLoading);
        }, 1500);
    };

    const handleRemove = (index: number) => {
        const newImages = [...images];
        newImages[index] = null;
        onImagesChange(newImages);
    };

    return (
        <div className={`grid gap-4 mt-2 ${maxImages === 1 ? 'grid-cols-1' : 'grid-cols-4'} ${className}`}>
            {Array.from({ length: maxImages }).map((_, index) => (
                <div key={index} className="flex flex-col gap-1">
                    {labels && labels[index] && (
                        <span className="text-xs font-medium text-gray-500 text-center">
                            {labels[index]}
                        </span>
                    )}
                    <div className={`relative ${ratioClass}`}>
                        <input
                            type="file"
                            id={`file-upload-${uniqueIdBase}-${index}`}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    handleFileChange(index, e.target.files[0]);
                                }
                            }}
                            disabled={loadingImages[index] || images[index] !== null}
                        />

                        {loadingImages[index] ? (
                            <div className="w-full h-full border-2 border-dashed border-[#F34A23] rounded-lg flex flex-col items-center justify-center bg-orange-50 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-orange-200">
                                    <div className="h-full bg-[#F34A23] animate-[loading_1.5s_ease-in-out_infinite]"></div>
                                </div>
                                <svg className="w-8 h-8 text-[#F34A23]/50 mb-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-[10px] text-[#F34A23] font-medium">{loadingText}</span>
                            </div>
                        ) : images[index] ? (
                            <div className="relative w-full h-full rounded-lg overflow-hidden border border-gray-200 group">
                                <img
                                    src={typeof images[index] === 'string'
                                        ? (images[index] as string)
                                        : URL.createObjectURL(images[index] as File)
                                    }
                                    alt={`Upload ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove(index);
                                    }}
                                    className="absolute top-2 right-2 z-10 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                    aria-label="Remove image"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <label
                                htmlFor={`file-upload-${uniqueIdBase}-${index}`}
                                className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#F34A23] hover:bg-gray-50 transition-all group"
                            >
                                <div className="relative">
                                    <svg className="w-8 h-8 text-gray-400 group-hover:text-[#F34A23] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <div className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow-sm border border-gray-200 group-hover:border-[#F34A23] transition-colors">
                                        <svg className="w-3 h-3 text-gray-500 group-hover:text-[#F34A23]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                </div>
                                {placeholderText && maxImages === 1 && (
                                    <span className="mt-2 text-xs text-gray-500 font-medium">{placeholderText}</span>
                                )}
                            </label>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

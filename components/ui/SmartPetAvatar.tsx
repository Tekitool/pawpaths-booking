import Image from 'next/image';
import { useState, useEffect } from 'react';
import { PawPrint } from 'lucide-react';

/**
 * SmartPetAvatar component that displays a pet photo with smart fallbacks.
 * Priority: User Uploaded File > Breed Default Image > Generic Placeholder
 */
export const SmartPetAvatar = ({
    userUploadedFile,
    breedDefaultImageUrl,
    petName = 'Pet',
    className = '',
    size = 128
}: {
    userUploadedFile?: File | string | null;
    breedDefaultImageUrl?: string | null;
    petName?: string;
    className?: string;
    size?: number;
}) => {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);

    // Create and revoke object URLs safely inside useEffect
    useEffect(() => {
        if (!(userUploadedFile instanceof File)) {
            setBlobUrl(null);
            return;
        }

        const url = URL.createObjectURL(userUploadedFile);
        setBlobUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [userUploadedFile]);

    // Resolve final display image: blob URL > string URL > breed default > null
    let displayImage: string | null = null;
    if (userUploadedFile instanceof File) {
        displayImage = blobUrl;
    } else if (typeof userUploadedFile === 'string' && userUploadedFile) {
        displayImage = userUploadedFile;
    } else if (breedDefaultImageUrl) {
        displayImage = breedDefaultImageUrl;
    }

    return (
        <div
            className={`relative overflow-hidden rounded-2xl border-2 border-slate-100 bg-slate-50 shadow-sm flex items-center justify-center ${className}`}
            style={{ width: size, height: size }}
        >
            {displayImage ? (
                <Image
                    src={displayImage}
                    alt={`${petName} profile`}
                    fill
                    className="object-cover"
                    sizes={`${size}px`}
                    priority={!!userUploadedFile}
                />
            ) : (
                <div className="flex flex-col items-center justify-center text-slate-300">
                    <PawPrint size={size * 0.4} />
                </div>
            )}
        </div>
    );
};

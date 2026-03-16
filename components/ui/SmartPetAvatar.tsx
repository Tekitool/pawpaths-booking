import Image from 'next/image';
import { useMemo } from 'react';
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
}) => {

    const displayImage = useMemo(() => {
        if (userUploadedFile) {
            if (userUploadedFile instanceof File) {
                return URL.createObjectURL(userUploadedFile);
            }
            // If it's already a URL (e.g. from storage)
            return userUploadedFile;
        }

        // Fallback to breed image
        if (breedDefaultImageUrl) {
            return breedDefaultImageUrl;
        }

        // No image available
        return null;
    }, [userUploadedFile, breedDefaultImageUrl]);

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

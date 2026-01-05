import Image from 'next/image';
import { getPublicUrl } from '@/lib/services/storage';

const OptimizedImage = ({ bucket, path, alt, width, height, className, ...props }) => {
    const imageUrl = getPublicUrl(bucket, path);

    if (!imageUrl) {
        return null; // Or a placeholder
    }

    return (
        <Image
            src={imageUrl}
            alt={alt || 'Image'}
            width={width}
            height={height}
            className={className}
            {...props}
        />
    );
};

export default OptimizedImage;

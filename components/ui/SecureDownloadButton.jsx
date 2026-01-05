import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { generateSignedUrl } from '@/lib/actions/storage';
import { Download } from 'lucide-react';

const SecureDownloadButton = ({ path, label = 'Download', className, ...props }) => {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        try {
            setLoading(true);
            // Use Server Action to generate URL (Bypasses RLS for authorized download)
            const url = await generateSignedUrl(path);

            if (url) {
                window.open(url, '_blank');
            } else {
                alert('Failed to generate secure link. You may not have permission.');
            }
        } catch (error) {
            console.error('Error downloading file:', error);
            alert('Download error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button onClick={handleDownload} isLoading={loading} className={className} {...props}>
            <Download className="mr-2 h-4 w-4" />
            {label}
        </Button>
    );
};

export default SecureDownloadButton;

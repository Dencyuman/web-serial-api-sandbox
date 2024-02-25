import React from 'react';
import { Loader } from 'lucide-react';

const LoadingOverlay = () => {
    return (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
            <Loader className="animate-spin" size={48} color="#fff" />
        </div>
    );
};

export default LoadingOverlay;

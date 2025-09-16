import React, { useState, useRef, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import { Prospect, Property, PropertyPhoto } from '../../prospects/types';
import { UploadIcon, CloseIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '../../../components/icons';

interface PropertyPhotosModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: Property;
    loan: Prospect;
    onUpload: (prospectId: string, propertyId: string, file: File) => Promise<void>;
    onDelete: (prospectId: string, propertyId: string, photo: PropertyPhoto) => Promise<void>;
}

const PropertyPhotosModal: React.FC<PropertyPhotosModalProps> = ({ isOpen, onClose, property, loan, onUpload, onDelete }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const photos = property.photos || [];

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsUploading(true);
            try {
                await onUpload(loan.id, property.id, file);
            } catch (error) {
                console.error("Upload failed", error);
                alert("Photo upload failed. Please try again.");
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = ''; // Reset file input
                }
            }
        }
    };
    
    const handleDelete = async (photo: PropertyPhoto) => {
        if(window.confirm("Are you sure you want to delete this photo?")) {
            try {
                await onDelete(loan.id, property.id, photo);
            } catch (error) {
                 console.error("Delete failed", error);
                alert("Failed to delete photo. Please try again.");
            }
        }
    }

    const handlePhotoClick = (index: number) => {
        setLightboxIndex(index);
    };

    const handleCloseLightbox = () => {
        setLightboxIndex(null);
    };

    const handleNextPhoto = () => {
        if (lightboxIndex !== null) {
            setLightboxIndex((lightboxIndex + 1) % photos.length);
        }
    };

    const handlePrevPhoto = () => {
        if (lightboxIndex !== null) {
            setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length);
        }
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (lightboxIndex === null) return;
            if (event.key === 'Escape') {
                handleCloseLightbox();
            } else if (event.key === 'ArrowRight') {
                handleNextPhoto();
            } else if (event.key === 'ArrowLeft') {
                handlePrevPhoto();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [lightboxIndex, photos.length]);


    const renderLightbox = () => {
        if (lightboxIndex === null) return null;

        const photo = photos[lightboxIndex];
        if (!photo) return null;

        return (
            <div 
                className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center"
                onClick={handleCloseLightbox}
                role="dialog"
                aria-modal="true"
            >
                {/* Close button */}
                <button 
                    className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
                    onClick={handleCloseLightbox}
                    aria-label="Close image viewer"
                >
                    <CloseIcon className="h-8 w-8" />
                </button>
                
                {/* Image container */}
                <div 
                    className="relative w-full max-w-4xl h-full max-h-[90vh] flex items-center justify-center p-4"
                    onClick={e => e.stopPropagation()} // Prevent closing when clicking the image/container
                >
                    <img 
                        src={photo.url} 
                        alt={`Property photo ${lightboxIndex + 1}`}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    />
                </div>
                
                {/* Prev button */}
                <button
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-30 rounded-full p-2 hover:bg-opacity-50 z-50"
                    onClick={e => { e.stopPropagation(); handlePrevPhoto(); }}
                    aria-label="Previous image"
                >
                    <ChevronLeftIcon className="h-6 w-6" />
                </button>

                {/* Next button */}
                <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-30 rounded-full p-2 hover:bg-opacity-50 z-50"
                    onClick={e => { e.stopPropagation(); handleNextPhoto(); }}
                    aria-label="Next image"
                >
                    <ChevronRightIcon className="h-6 w-6" />
                </button>

                {/* Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
                    {lightboxIndex + 1} / {photos.length}
                </div>
            </div>
        );
    };


    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title={`Photos for ${property.description}`}>
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center pb-4 border-b">
                        <p className="text-sm text-gray-600 mb-2 sm:mb-0">Manage photos for this property.</p>
                        <button
                            onClick={handleUploadClick}
                            disabled={isUploading}
                            className="w-full sm:w-auto flex items-center justify-center bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            <UploadIcon className="h-5 w-5 mr-2" />
                            {isUploading ? 'Uploading...' : 'Upload Photo'}
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>

                    {photos.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto p-1">
                            {photos.map((photo, index) => (
                                <div 
                                    key={photo.id} 
                                    className="relative group aspect-square cursor-pointer"
                                    onClick={() => handlePhotoClick(index)}
                                >
                                    <img src={photo.url} alt="Property" className="w-full h-full object-cover rounded-lg shadow-sm" />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent opening lightbox
                                                handleDelete(photo);
                                            }}
                                            className="absolute top-1 right-1 p-1 bg-white/70 rounded-full text-red-600 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                            title="Delete Photo"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
                            <p>No photos have been uploaded for this property yet.</p>
                        </div>
                    )}
                    <div className="pt-4 flex justify-end">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-300">
                            Close
                        </button>
                    </div>
                </div>
            </Modal>
            {renderLightbox()}
        </>
    );
};

export default PropertyPhotosModal;
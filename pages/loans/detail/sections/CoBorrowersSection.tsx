import React, { useState } from 'react';
import { Prospect, CoBorrower } from '../../../prospects/types';
import { AddIcon, EditIcon, TrashIcon } from '../../../../components/icons';
import CoBorrowerModal from '../CoBorrowerModal';

interface CoBorrowersSectionProps {
    loan: Prospect;
    onUpdate: (updatedData: { co_borrowers: CoBorrower[] }) => void;
}

const CoBorrowersSection: React.FC<CoBorrowersSectionProps> = ({ loan, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoBorrower, setEditingCoBorrower] = useState<CoBorrower | null>(null);

    const coBorrowers = loan.co_borrowers || [];

    const handleOpenModal = (coBorrower: CoBorrower | null = null) => {
        setEditingCoBorrower(coBorrower);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCoBorrower(null);
    };

    const handleSave = (coBorrower: CoBorrower) => {
        let updatedList;
        if (editingCoBorrower) {
            // Update existing
            updatedList = coBorrowers.map(cb => cb.id === coBorrower.id ? coBorrower : cb);
        } else {
            // Add new
            updatedList = [...coBorrowers, coBorrower];
        }
        onUpdate({ co_borrowers: updatedList });
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this co-borrower?')) {
            const updatedList = coBorrowers.filter(cb => cb.id !== id);
            onUpdate({ co_borrowers: updatedList });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Co-Borrowers / Other Parties</h3>
                 <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 text-sm flex items-center">
                    <AddIcon className="h-4 w-4 mr-1" /> Add Co-Borrower
                </button>
            </div>

            {coBorrowers.length > 0 ? (
                 <div className="overflow-x-auto">
                    <table className="min-w-full bg-white divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Phone</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="relative px-4 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {coBorrowers.map((cb) => (
                                <tr key={cb.id}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cb.full_name}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{`${cb.mailing_address?.street || ''}, ${cb.mailing_address?.city || ''}`}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{cb.phone_numbers?.work}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{cb.email}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                        <button onClick={() => handleOpenModal(cb)} className="text-blue-600 hover:text-blue-900"><EditIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleDelete(cb.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center p-8 text-gray-500 border-2 border-dashed rounded-lg">
                    No co-borrowers have been added for this loan.
                </div>
            )}

            <CoBorrowerModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                coBorrower={editingCoBorrower}
            />
        </div>
    );
};

export default CoBorrowersSection;

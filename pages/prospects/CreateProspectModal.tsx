import React, { useState } from 'react';
import Modal from '../../components/ui/Modal';
import { UserProfile, Prospect } from './types';
import { AddIcon } from '../../components/icons';

interface CreateProspectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddProspect: (prospectData: Omit<Prospect, 'id' | 'prospect_code' | 'created_at' | 'status' | 'current_stage' | 'current_stage_name' | 'assigned_to_name' | 'stages' | 'rejected_at_stage'>) => void;
    users: UserProfile[];
}

const CreateProspectModal: React.FC<CreateProspectModalProps> = ({ isOpen, onClose, onAddProspect, users }) => {
    const [clientName, setClientName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [loanAmount, setLoanAmount] = useState('');
    const [clientType, setClientType] = useState<'individual' | 'company' | 'both'>('individual');
    const [loanType, setLoanType] = useState<'purchase' | 'refinance'>('purchase');
    const [assignedTo, setAssignedTo] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientName || !assignedTo) {
            setError('Client Name and Assigned To are required.');
            return;
        }
        
        onAddProspect({
            client_name: clientName,
            email,
            phone_number: phone,
            loan_amount: parseFloat(loanAmount) || 0,
            client_type: clientType,
            loan_type: loanType,
            assigned_to: assignedTo,
        });

        // Reset form and close
        setClientName('');
        setEmail('');
        setPhone('');
        setLoanAmount('');
        setClientType('individual');
        setLoanType('purchase');
        setAssignedTo('');
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Prospect">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">Client Name</label>
                    <input type="text" id="clientName" value={clientName} onChange={e => setClientName(e.target.value)} className="input-field mt-1" placeholder="E.g., John Doe or Innovate Corp" required/>
                </div>
                 <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field mt-1" placeholder="E.g., name@example.com" />
                </div>
                 <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="input-field mt-1" placeholder="E.g., 305-555-1234" />
                </div>
                <div>
                    <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700">Loan Amount</label>
                    <input type="number" id="loanAmount" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} className="input-field mt-1" placeholder="E.g., 250000" />
                </div>
                
                {/* Client Type Radio */}
                <div>
                    <span className="block text-sm font-medium text-gray-700">Client Type</span>
                    <div className="mt-2 flex space-x-4">
                        <label className="flex items-center"><input type="radio" name="clientType" value="individual" checked={clientType === 'individual'} onChange={() => setClientType('individual')} className="h-4 w-4 text-blue-600"/> <span className="ml-2">Individual</span></label>
                        <label className="flex items-center"><input type="radio" name="clientType" value="company" checked={clientType === 'company'} onChange={() => setClientType('company')} className="h-4 w-4 text-blue-600"/> <span className="ml-2">Company</span></label>
                        <label className="flex items-center"><input type="radio" name="clientType" value="both" checked={clientType === 'both'} onChange={() => setClientType('both')} className="h-4 w-4 text-blue-600"/> <span className="ml-2">Both</span></label>
                    </div>
                </div>

                {/* Loan Type Radio */}
                 <div>
                    <span className="block text-sm font-medium text-gray-700">Loan Type</span>
                    <div className="mt-2 flex space-x-4">
                        <label className="flex items-center"><input type="radio" name="loanType" value="purchase" checked={loanType === 'purchase'} onChange={() => setLoanType('purchase')} className="h-4 w-4 text-blue-600"/> <span className="ml-2">Purchase</span></label>
                        <label className="flex items-center"><input type="radio" name="loanType" value="refinance" checked={loanType === 'refinance'} onChange={() => setLoanType('refinance')} className="h-4 w-4 text-blue-600"/> <span className="ml-2">Refinance</span></label>
                    </div>
                </div>

                <div>
                    <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">Assigned to</label>
                    <select id="assignedTo" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="input-field mt-1" required>
                        <option value="" disabled>Select user...</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                        ))}
                    </select>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-300">
                        Cancel
                    </button>
                    <button type="submit" className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 flex items-center">
                        <AddIcon className="h-5 w-5 mr-1"/> Create Prospect
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateProspectModal;
import React from 'react';
import { Stage } from '../types';
import { CheckCircleIcon } from '../../../components/icons';

interface StageStepperProps {
    stages: Stage[];
}

const StageStepper: React.FC<StageStepperProps> = ({ stages }) => {
    return (
        <div className="flex items-center">
            {stages.map((stage, index) => {
                const isCompleted = stage.status === 'completed';
                const isInProgress = stage.status === 'in_progress';
                
                return (
                    <React.Fragment key={stage.id}>
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                                isInProgress ? 'bg-blue-500 border-blue-500 text-white' : 
                                'bg-white border-gray-300 text-gray-500'
                            }`}>
                                {isCompleted ? <CheckCircleIcon className="h-5 w-5" /> : <span>{stage.id}</span>}
                            </div>
                            <p className={`text-xs mt-1 text-center ${
                                isCompleted || isInProgress ? 'font-semibold text-gray-800' : 'text-gray-500'
                            }`}>{stage.name}</p>
                        </div>
                        {index < stages.length - 1 && (
                            <div className={`flex-1 h-1 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default StageStepper;
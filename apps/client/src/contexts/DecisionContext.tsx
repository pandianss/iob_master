import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';

interface DecisionState {
    step: number;
    formData: {
        title: string;
        context: string;
        classification: string;
        attachments: any[];
        governanceReview: boolean;
    };
}

type DecisionAction =
    | { type: 'SET_STEP'; payload: number }
    | { type: 'UPDATE_FORM'; payload: Partial<DecisionState['formData']> }
    | { type: 'RESET' };

const initialState: DecisionState = {
    step: 1,
    formData: {
        title: '',
        context: '',
        classification: 'GENERAL',
        attachments: [],
        governanceReview: false
    }
};

const DecisionContext = createContext<{
    state: DecisionState;
    dispatch: React.Dispatch<DecisionAction>;
} | undefined>(undefined);

function decisionReducer(state: DecisionState, action: DecisionAction): DecisionState {
    switch (action.type) {
        case 'SET_STEP':
            return { ...state, step: action.payload };
        case 'UPDATE_FORM':
            return { ...state, formData: { ...state.formData, ...action.payload } };
        case 'RESET':
            return initialState;
        default:
            return state;
    }
}

export const DecisionProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(decisionReducer, initialState);
    return (
        <DecisionContext.Provider value={{ state, dispatch }}>
            {children}
        </DecisionContext.Provider>
    );
};

export const useDecision = () => {
    const context = useContext(DecisionContext);
    if (!context) throw new Error('useDecision must be used within a DecisionProvider');
    return context;
};

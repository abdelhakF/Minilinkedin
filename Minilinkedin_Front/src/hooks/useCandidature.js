import { useContext } from 'react';
import { CandidatureContext } from '../context/CandidatureContext';

export const useCandidature = () => {
  const context = useContext(CandidatureContext);
  if (!context) {
    throw new Error('useCandidature must be used within a CandidatureProvider');
  }
  return context;
};

import React, { useState } from 'react';
import { SettlementExplainerInputs, AISettlementResponse } from '../types';
import { generateSettlementExplanation } from '../services/geminiService';
import { SparklesIcon, GavelIcon } from './icons';

const initialState: SettlementExplainerInputs = {
  bet_id: `BET-${Math.floor(Date.now() / 1000)}`,
  selection_details: 'India to win vs Australia',
  final_outcome: 'Match abandoned due to rain after 10 overs. India was 100/1.',
  settlement_status: 'Void',
  special_circumstances: 'Match did not reach the minimum required overs (15) for a result.',
};

const SettlementExplainer: React.FC = () => {
  const [formData, setFormData] = useState<SettlementExplainerInputs>(initialState);
  const [result, setResult] = useState<AISettlementResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const apiResult = await generateSettlementExplanation(formData);
      if (apiResult) {
        setResult(apiResult);
      } else {
        setError('The AI could not generate a settlement explanation. Please check your inputs.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const FormInput: React.FC<{label: string, name: keyof SettlementExplainerInputs, value: string, as?: 'textarea' | 'input' | 'select'}> = ({ label, name, value, as = 'input' }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-400">{label}</label>
      {as === 'textarea' ? (
        <textarea id={name} name={name} value={value} onChange={handleChange} rows={3} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-brand-primary focus:border-brand-primary" />
      ) : as === 'select' ? (
         <select id={name} name={name} value={value} onChange={handleChange} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-brand-primary focus:border-brand-primary">
            <option value="Win">Win</option>
            <option value="Loss">Loss</option>
            <option value="Void">Void</option>
        </select>
      ) : (
        <input type="text" id={name} name={name} value={value} onChange={handleChange} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-brand-primary focus:border-brand-primary" />
      )}
    </div>
  );

  return (
    <div>
      <h2 className="text-3xl font-bold mb-1 text-white">Admin: Explainable Settlement</h2>
      <p className="text-gray-400 mb-6">Generate human-readable settlement explanations and structured audit logs.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Column */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-2">Settlement Details</h3>
            <FormInput label="Bet ID" name="bet_id" value={formData.bet_id} />
            <FormInput label="Selection Details" name="selection_details" value={formData.selection_details} as="textarea" />
            <FormInput label="Final Outcome" name="final_outcome" value={formData.final_outcome} as="textarea" />
            <FormInput label="Settlement Status" name="settlement_status" value={formData.settlement_status} as="select" />
            <FormInput label="Special Circumstances / Notes" name="special_circumstances" value={formData.special_circumstances} as="textarea" />
            <button type="submit" disabled={isLoading} className="w-full bg-brand-primary text-white font-bold py-3 rounded-md transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 flex items-center justify-center space-x-2">
                {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                    <SparklesIcon className="w-5 h-5"/>
                )}
                <span>{isLoading ? 'Generating...' : 'Generate Explanation'}</span>
            </button>
          </form>
        </div>
        
        {/* Result Column */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col justify-center">
            {isLoading && (
                 <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
                    <p className="mt-4 text-gray-400">AI is generating the report...</p>
                 </div>
            )}
            {error && (
                <div className="text-center p-4 bg-red-900/50 border border-red-700 rounded-md">
                    <h4 className="font-bold text-red-400">Error</h4>
                    <p className="text-red-300 mt-1">{error}</p>
                </div>
            )}
            {!isLoading && !error && !result && (
                <div className="text-center text-gray-500">
                    <GavelIcon className="w-16 h-16 mx-auto mb-4"/>
                    <p>Generated settlement report will appear here.</p>
                </div>
            )}
            {result && (
                <div className="w-full animate-fade-in space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Customer-Facing Explanation</h3>
                        <blockquote className="border-l-4 border-brand-primary pl-4 py-2 bg-gray-900/50 rounded-r-md">
                            <p className="text-base italic text-gray-300">"{result.human_explanation}"</p>
                        </blockquote>
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Audit Log JSON</h3>
                        <pre className="bg-gray-900/70 p-4 rounded-md text-xs text-green-300 overflow-x-auto">
                           <code>
                            {JSON.stringify(result.audit_json, null, 2)}
                           </code>
                        </pre>
                    </div>
                </div>
            )}
        </div>
      </div>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default SettlementExplainer;
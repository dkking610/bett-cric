
import React, { useState } from 'react';
import { OddsSuggesterInputs, AIOdds } from '../types';
import { suggestOdds } from '../services/geminiService';
// FIX: Import CalculatorIcon to resolve reference error.
import { SparklesIcon, CalculatorIcon } from './icons';

const initialState: OddsSuggesterInputs = {
  homeTeam: 'India',
  awayTeam: 'Australia',
  competition: 'T20 World Cup',
  venue: 'Kensington Oval, Barbados',
  homeForm: 'W,W,W,L,W',
  awayForm: 'W,W,L,W,W',
  h2h: '12-0-8',
  homeAdvantage: 0.6,
  keyInjuries: 'Mitchell Starc (doubtful)',
  pitchCharacter: 'batting-friendly',
  weather: 'Clear skies',
};

const OddsSuggester: React.FC = () => {
  const [formData, setFormData] = useState<OddsSuggesterInputs>(initialState);
  const [result, setResult] = useState<AIOdds | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const apiResult = await suggestOdds(formData);
      if (apiResult) {
        setResult(apiResult);
      } else {
        setError('The AI could not generate odds based on the provided data. Please check your inputs.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const FormInput: React.FC<{label: string, name: keyof OddsSuggesterInputs, value: string, placeholder?: string}> = ({ label, name, value, placeholder }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-400">{label}</label>
      <input
        type="text"
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-brand-primary focus:border-brand-primary"
      />
    </div>
  );

  return (
    <div>
      <h2 className="text-3xl font-bold mb-1 text-white">Admin: AI Odds Suggester</h2>
      <p className="text-gray-400 mb-6">Input match data to generate deterministic odds suggestions.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Column */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-2">Match Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="Home Team" name="homeTeam" value={formData.homeTeam} />
              <FormInput label="Away Team" name="awayTeam" value={formData.awayTeam} />
              <FormInput label="Competition" name="competition" value={formData.competition} />
              <FormInput label="Venue" name="venue" value={formData.venue} />
              <FormInput label="Home Form (Last 5)" name="homeForm" value={formData.homeForm} placeholder="e.g., W,L,W,D,W" />
              <FormInput label="Away Form (Last 5)" name="awayForm" value={formData.awayForm} placeholder="e.g., L,L,W,D,W" />
            </div>
            <h3 className="text-xl font-semibold text-white pt-4 mb-2">Factors & Conditions</h3>
            <FormInput label="Head-to-Head (H-D-A)" name="h2h" value={formData.h2h} placeholder="e.g., 8-5-7" />
             <div>
                <label htmlFor="homeAdvantage" className="block text-sm font-medium text-gray-400">Home Advantage Factor: <span className="font-bold text-brand-secondary">{formData.homeAdvantage.toFixed(2)}</span></label>
                <input
                    type="range"
                    id="homeAdvantage"
                    name="homeAdvantage"
                    min="0"
                    max="1"
                    step="0.05"
                    value={formData.homeAdvantage}
                    onChange={handleRangeChange}
                    className="mt-1 w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
            </div>
            <div>
              <label htmlFor="pitchCharacter" className="block text-sm font-medium text-gray-400">Pitch Character</label>
              <select id="pitchCharacter" name="pitchCharacter" value={formData.pitchCharacter} onChange={handleChange} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-brand-primary focus:border-brand-primary">
                <option value="balanced">Balanced</option>
                <option value="batting-friendly">Batting-Friendly</option>
                <option value="bowling-friendly">Bowling-Friendly</option>
              </select>
            </div>
             <FormInput label="Weather Note" name="weather" value={formData.weather} />
            <div>
                <label htmlFor="keyInjuries" className="block text-sm font-medium text-gray-400">Key Injuries (comma-separated)</label>
                <textarea id="keyInjuries" name="keyInjuries" value={formData.keyInjuries} onChange={handleChange} rows={2} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-brand-primary focus:border-brand-primary"></textarea>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-brand-primary text-white font-bold py-3 rounded-md transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 flex items-center justify-center space-x-2">
                {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                    <SparklesIcon className="w-5 h-5"/>
                )}
                <span>{isLoading ? 'Generating...' : 'Generate Odds'}</span>
            </button>
          </form>
        </div>
        
        {/* Result Column */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex items-center justify-center">
            {isLoading && (
                 <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
                    <p className="mt-4 text-gray-400">AI is analyzing the data...</p>
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
                    <CalculatorIcon className="w-16 h-16 mx-auto mb-4"/>
                    <p>Results will appear here once generated.</p>
                </div>
            )}
            {result && (
                <div className="w-full animate-fade-in">
                    <h3 className="text-xl font-semibold text-white text-center">{formData.homeTeam} vs {formData.awayTeam}</h3>
                    <p className="text-sm text-gray-400 text-center mb-4">{formData.competition}</p>
                    
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-300 mb-1">AI Rationale:</h4>
                            <blockquote className="border-l-4 border-brand-primary pl-3 py-1 bg-gray-900/50 rounded-r-md">
                                <p className="text-sm italic text-gray-300">"{result.rationale_short}"</p>
                            </blockquote>
                        </div>
                        <table className="w-full text-sm text-left text-gray-400 bg-gray-900/50 rounded-md overflow-hidden">
                            <thead className="bg-gray-700 text-xs text-gray-300 uppercase">
                                <tr>
                                    <th scope="col" className="py-2 px-3">Outcome</th>
                                    <th scope="col" className="py-2 px-3 text-center">AI Odds</th>
                                    <th scope="col" className="py-2 px-3 text-center">AI Prob.</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-700">
                                    <td className="py-2 px-3 font-semibold text-gray-300">{formData.homeTeam} (Home)</td>
                                    <td className="py-2 px-3 text-center font-bold text-brand-secondary">{result.home.odds?.toFixed(3) || 'N/A'}</td>
                                    <td className="py-2 px-3 text-center">{result.home.implied_prob?.toFixed(2) || 'N/A'}%</td>
                                </tr>
                                <tr className="border-b border-gray-700">
                                    <td className="py-2 px-3 font-semibold text-gray-300">Draw</td>
                                    <td className="py-2 px-3 text-center font-bold text-brand-secondary">{result.draw.odds?.toFixed(3) || 'N/A'}</td>
                                    <td className="py-2 px-3 text-center">{result.draw.implied_prob?.toFixed(2) || 'N/A'}%</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3 font-semibold text-gray-300">{formData.awayTeam} (Away)</td>
                                    <td className="py-2 px-3 text-center font-bold text-brand-secondary">{result.away.odds?.toFixed(3) || 'N/A'}</td>
                                    <td className="py-2 px-3 text-center">{result.away.implied_prob?.toFixed(2) || 'N/A'}%</td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="text-center bg-gray-900/50 p-2 rounded-md">
                            <span className="text-xs uppercase text-gray-500">Bookmaker Margin</span>
                            <p className="font-bold text-white">{result.book_margin_percent.toFixed(2)}%</p>
                        </div>
                         {result.notes && (
                            <div className="text-center bg-yellow-900/50 p-2 rounded-md">
                                <span className="text-xs uppercase text-yellow-500">Notes from AI</span>
                                <p className="font-medium text-yellow-300 text-sm">{result.notes}</p>
                            </div>
                        )}
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
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #00A693;
          cursor: pointer;
          border-radius: 50%;
        }
         input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #00A693;
          cursor: pointer;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
};

export default OddsSuggester;

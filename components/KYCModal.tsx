
import React, { useState, useCallback } from 'react';
import { AIKycResponse } from '../types';
import { performKycCheck } from '../services/geminiService';
import { XMarkIcon, CameraIcon, CheckCircleIcon, ExclamationTriangleIcon } from './icons';

interface KYCModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    mimeType: file.type,
    data: await base64EncodedDataPromise,
  };
};

const KYCModal: React.FC<KYCModalProps> = ({ isVisible, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kycResult, setKycResult] = useState<AIKycResponse | null>(null);

  const resetState = useCallback(() => {
    setSelectedFile(null);
    setImagePreview(null);
    setIsLoading(false);
    setError(null);
    setKycResult(null);
  }, []);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      resetState();
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleVerify = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setError(null);
    setKycResult(null);
    try {
      const imagePart = await fileToGenerativePart(selectedFile);
      const result = await performKycCheck(imagePart.data, imagePart.mimeType);
      if (result) {
        setKycResult(result);
      } else {
        setError('AI verification failed. Please try a clearer image.');
      }
    } catch (e) {
      setError('An unexpected error occurred during verification.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const ResultRow: React.FC<{ label: string; value: string; }> = ({ label, value }) => (
    <div className="flex justify-between text-sm py-2 border-b border-gray-700 last:border-0">
        <span className="text-gray-400">{label}</span>
        <span className="font-semibold text-white">{value}</span>
    </div>
  );

  const QualityCheck: React.FC<{ label: string; passed: boolean; }> = ({ label, passed }) => (
    <div className="flex items-center space-x-2 text-sm">
        {passed ? <CheckCircleIcon className="w-5 h-5 text-green-500" /> : <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />}
        <span className={passed ? 'text-gray-300' : 'text-yellow-400'}>{label}</span>
    </div>
  );

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-lg shadow-2xl animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Verify Your Identity</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-white">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Upload */}
            <div className="flex flex-col items-center justify-center">
              <label htmlFor="kyc-upload" className="w-full cursor-pointer">
                {imagePreview ? (
                    <img src={imagePreview} alt="ID Preview" className="w-full h-48 object-contain rounded-md bg-black" />
                ) : (
                    <div className="w-full h-48 border-2 border-dashed border-gray-600 rounded-md flex flex-col items-center justify-center text-gray-500 hover:bg-gray-700 hover:border-gray-500 transition-colors">
                        <CameraIcon className="w-12 h-12" />
                        <span className="mt-2 text-sm font-semibold">Upload ID Document</span>
                    </div>
                )}
              </label>
              <input type="file" id="kyc-upload" accept="image/*" className="hidden" onChange={handleFileChange} />
              <button 
                onClick={handleVerify} 
                disabled={!selectedFile || isLoading}
                className="w-full mt-4 bg-brand-primary text-white font-bold py-2 rounded-md transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 flex justify-center items-center"
              >
                {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Verify with AI'}
              </button>
            </div>
            
            {/* Right Column: Results */}
            <div className="bg-gray-900/50 p-4 rounded-md">
                <h3 className="font-semibold text-white mb-3 text-center">Verification Results</h3>
                {isLoading && <p className="text-sm text-center text-gray-400 py-10">AI is analyzing your document...</p>}
                {error && <p className="text-sm text-center text-red-400 py-10">{error}</p>}
                {!isLoading && !error && !kycResult && <p className="text-sm text-center text-gray-500 py-10">Results will appear here.</p>}
                
                {kycResult && (
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-xs text-gray-400 font-bold uppercase mb-1">Extracted Data</h4>
                            <ResultRow label="ID Type" value={kycResult.id_type} />
                            <ResultRow label="Full Name" value={kycResult.extracted_name} />
                            <ResultRow label="Date of Birth" value={kycResult.extracted_dob} />
                        </div>
                         <div>
                            <h4 className="text-xs text-gray-400 font-bold uppercase mb-2">Image Quality</h4>
                            <div className="space-y-1.5">
                                <QualityCheck label="Image is Clear" passed={kycResult.is_clear} />
                                <QualityCheck label="No Obscuring Glare" passed={!kycResult.has_glare} />
                                <QualityCheck label="All Corners Visible" passed={kycResult.all_corners_visible} />
                            </div>
                            {!kycResult.is_clear && <p className="text-xs text-yellow-400 mt-3">{kycResult.quality_notes}</p>}
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default KYCModal;

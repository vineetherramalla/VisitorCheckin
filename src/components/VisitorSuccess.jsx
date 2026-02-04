import { useNavigate } from 'react-router-dom';
import { CheckCircle, RefreshCw, Building2 } from 'lucide-react';

const VisitorSuccess = () => {
    const navigate = useNavigate();
    const companyName = import.meta.env.VITE_COMPANY_NAME || 'SRIA INFOTECH PVT LTD';
    const companyLogo = import.meta.env.VITE_COMPANY_LOGO || '/logo.png';

    const handleSubmitAnother = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Company Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="flex justify-center mb-6">
                        <img
                            src={companyLogo}
                            alt={companyName}
                            className="h-24 w-auto object-contain"
                        />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{companyName}</h1>
                    <p className="text-base md:text-lg text-gray-600">Visitor Registration</p>
                </div>

                {/* Success Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12 text-center animate-slide-up">
                    {/* Success Icon */}
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>

                    {/* Success Message */}
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                        Check-in Successful!
                    </h2>
                    <p className="text-gray-600 text-lg mb-8">
                        Your visit has been successfully registered. Thank you for visiting {companyName}.
                    </p>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                        <button
                            onClick={handleSubmitAnother}
                            className="w-full btn-primary flex items-center justify-center space-x-2"
                        >
                            <RefreshCw className="w-5 h-5" />
                            <span>Submit Another Response</span>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-500 space-y-2">
                    <p>Your information will be kept confidential and used only for visitor management purposes.</p>
                    <p className="text-xs">© {new Date().getFullYear()} {companyName}. All rights reserved.</p>
                </div>            </div>
        </div>
    );
};

export default VisitorSuccess;

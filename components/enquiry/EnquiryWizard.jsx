'use client';

import React, { useRef, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Step1Travel from '@/components/enquiry/Step1Travel';
// ── Code-split: Steps 2-6 are downloaded on demand, not upfront ──────────────
// Their .preload() methods are called by usePrefetchWizardData in the background.
const Step2Pets = dynamic(() => import('@/components/enquiry/Step2Pets'), { ssr: false });
const Step3Services = dynamic(() => import('@/components/enquiry/Step3Services'), { ssr: false });
const Step4Documents = dynamic(() => import('@/components/enquiry/Step4Documents'), { ssr: false });
const Step5Review = dynamic(() => import('@/components/enquiry/Step5Review'), { ssr: false });
const Step6Success = dynamic(() => import('@/components/enquiry/Step6Success'), { ssr: false });
import ServiceLimitationModal from '@/components/enquiry/ServiceLimitationModal';
import ValidationFailureModal from '@/components/enquiry/ValidationFailureModal';
import useBookingStore from '@/lib/store/booking-store';
import { validateStep } from '@/lib/validations/booking-schemas';
import { usePrefetchWizardData } from '@/hooks/usePrefetchWizardData';
import Button from '@/components/ui/Button';
import { ArrowLeft, RotateCcw, ArrowRight, Check, Loader2 } from 'lucide-react';
import EnquiryHeader from '@/components/enquiry/EnquiryHeader';
import ElegantFooter from '@/components/ui/ElegantFooter';
import { isUAE } from '@/lib/utils/uae';

// Stable reference for dynamic component preloaders (avoids re-creating on every render)
const DYNAMIC_COMPONENTS = { Step2: Step2Pets, Step3: Step3Services, Step4: Step4Documents, Step5: Step5Review };

export default function EnquiryWizard({ countriesList = [] }) {
    const { currentStep, nextStep, prevStep, setStep, resetForm, formData } = useBookingStore();
    const cache = useBookingStore((s) => s._cache);

    // ── Background prefetch orchestration ─────────────────────────────────────
    usePrefetchWizardData(currentStep, formData, DYNAMIC_COMPONENTS);
    const step5Ref = useRef(null);
    const TOTAL_STEPS = 5;
    const [isLimitationModalOpen, setIsLimitationModalOpen] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
    // Lifted from Step5Review so the nav button layer can react to submission state
    const [isStep5Submitting, setIsStep5Submitting] = useState(false);

    // Track the highest step the user has successfully validated past.
    // Allows backward navigation to any visited step but blocks forward jumps.
    const [highestValidatedStep, setHighestValidatedStep] = useState(1);

    const handleStepClick = (step) => {
        if (currentStep === 6 || isStep5Submitting) return;
        // Only allow navigation to steps already visited (backward or current)
        if (step <= highestValidatedStep) {
            setStep(step);
        }
    };

    const validateRoute = () => {
        const { originCountry, destinationCountry } = formData.travelDetails;

        const isOriginUAE = isUAE(originCountry);
        const isDestUAE = isUAE(destinationCountry);

        // Valid if either origin OR destination is UAE
        return isOriginUAE || isDestUAE;
    };

    const handleContinue = () => {
        // Schema-based validation for the current step
        const { valid, errors } = validateStep(currentStep, formData);
        if (!valid) {
            setValidationErrors(errors);
            setIsValidationModalOpen(true);
            return;
        }

        // Step 1: additional business rule — UAE route check
        if (currentStep === 1 && !validateRoute()) {
            setIsLimitationModalOpen(true);
            return;
        }

        // Validation passed — advance the frontier so the user can navigate back to this step
        setHighestValidatedStep((prev) => Math.max(prev, currentStep + 1));

        if (currentStep === 5 && step5Ref.current) {
            // On step 5, trigger the submit handler
            step5Ref.current.handleSubmit();
        } else {
            nextStep();
        }
    };

    return (
        <div className="min-h-[100dvh] overflow-x-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <ServiceLimitationModal
                isOpen={isLimitationModalOpen}
                onClose={() => setIsLimitationModalOpen(false)}
            />
            <ValidationFailureModal
                isOpen={isValidationModalOpen}
                onClose={() => setIsValidationModalOpen(false)}
                errors={validationErrors}
            />
            <EnquiryHeader />

            <div className="py-6 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-color-01/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10 animate-pulse delay-1000"></div>

                <div className="max-w-4xl mx-auto">
                    <div className="mb-12 text-center relative">
                        <h1 className="text-accent tracking-tight mb-3">Start Your Relocation Enquiry</h1>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-brand-text-02/20 shadow-sm text-sm font-medium text-brand-text-02">
                            {currentStep === 6 ? (
                                <>
                                    <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-system-color-02 opacity-40"></span>
                                        <Check size={10} className="relative text-system-color-02" strokeWidth={3} />
                                    </span>
                                    <span className="text-system-color-02">Submitted ✓</span>
                                </>
                            ) : isStep5Submitting ? (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-accent animate-ping"></span>
                                    <span className="text-accent">Processing...</span>
                                </>
                            ) : (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-brand-color-01 animate-pulse"></span>
                                    Step {currentStep} of 5
                                </>
                            )}
                        </div>
                    </div>

                    {/* Premium Progress Bar */}
                    <div className="relative mb-10 sm:mb-16 px-4">
                        {/* Progress Bar Container */}
                        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_8px_32px_rgba(0,0,0,0.2)] p-1.5 relative h-5 w-full z-0">
                            {/* Track Background (Dark) */}
                            <div className="absolute inset-0 bg-gray-900/10 rounded-full"></div>

                            {/* Progress Fill */}
                            <div
                                className="h-full rounded-full relative transition-all duration-700 ease-out shadow-[0_2px_8px_rgba(255,107,107,0.4)] bg-gradient-to-r from-red-500 via-orange-400 via-amber-300 to-yellow-50"
                                style={{ width: `${Math.min(100, ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100)}%` }}
                            >
                                {/* Inner Glow */}
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-white/60 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                            </div>
                        </div>

                        {/* Steps Overlay */}
                        <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 px-4 flex justify-between pointer-events-none z-10">
                            {[1, 2, 3, 4, 5].map((step) => (
                                <div key={step} className="flex flex-col items-center relative group">
                                    {/* Step Circle */}
                                    <button
                                        onClick={() => handleStepClick(step)}
                                        disabled={currentStep === 6 || isStep5Submitting || step > highestValidatedStep}
                                        className={`
                                            w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-500 relative
                                            backdrop-blur-md shadow-lg pointer-events-auto
                                            ${currentStep === 6
                                                ? 'bg-system-color-02/80 border-system-color-02/50 text-white cursor-not-allowed opacity-70'
                                                : isStep5Submitting
                                                    ? 'cursor-not-allowed opacity-60 bg-accent/60 border-accent/40 text-white'
                                                    : step <= currentStep
                                                        ? 'bg-accent border-accent/50 text-white shadow-[0_0_20px_rgba(249,115,22,0.6)] scale-110 cursor-pointer hover:scale-110 hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] hover:border-accent/50 hover:bg-white/80 hover:text-accent'
                                                        : step <= highestValidatedStep
                                                            ? 'bg-white/60 border-accent/30 text-accent cursor-pointer hover:scale-110 hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] hover:border-accent/50 hover:bg-white/80'
                                                            : 'bg-white/40 border-white/40 text-brand-text-02/40 cursor-not-allowed opacity-60'
                                            }
                                        `}
                                        aria-label={currentStep === 6 ? `Step ${step} — submitted` : step <= highestValidatedStep ? `Go to step ${step}` : `Complete step ${step - 1} first`}
                                    >
                                        {/* Glossy Effect */}
                                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/50 to-transparent rounded-t-full"></div>
                                        {currentStep === 6 ? <Check size={16} strokeWidth={3} /> : step}
                                    </button>

                                    {/* Label — hidden on small screens to prevent overflow */}
                                    <button
                                        onClick={() => handleStepClick(step)}
                                        disabled={currentStep === 6 || isStep5Submitting || step > highestValidatedStep}
                                        className={`text-xs font-bold uppercase tracking-wider absolute -bottom-8 w-32 text-center transition-colors duration-300 pointer-events-auto hidden sm:block
                                            ${currentStep === 6
                                                ? 'text-system-color-02/60 cursor-not-allowed'
                                                : isStep5Submitting
                                                    ? 'text-brand-text-02/40 cursor-not-allowed'
                                                    : step === currentStep
                                                        ? 'text-accent cursor-pointer hover:text-accent'
                                                        : step <= highestValidatedStep
                                                            ? 'text-brand-color-01 cursor-pointer hover:text-accent'
                                                            : 'text-brand-text-02/30 cursor-not-allowed'
                                            }`}
                                    >
                                        {step === 1 && 'Travel'}
                                        {step === 2 && 'Pets'}
                                        {step === 3 && 'Services'}
                                        {step === 4 && 'Docs'}
                                        {step === 5 && 'Review'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white/60 backdrop-blur-xl shadow-level-1 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 md:p-12 border border-white/50 relative overflow-hidden max-w-5xl mx-auto">
                    {/* Content Container */}
                    <div className="relative z-10">
                        {currentStep === 1 && <Step1Travel countriesList={countriesList} />}
                        {currentStep === 2 && (
                            <Step2Pets
                                speciesList={cache.species || []}
                                breedsList={cache.breeds || []}
                                genderOptions={cache.genderOptions || []}
                            />
                        )}
                        {currentStep === 3 && <Step3Services />}
                        {currentStep === 4 && <Step4Documents />}
                        {currentStep === 5 && (
                            <Step5Review
                                ref={step5Ref}
                                speciesList={cache.species || []}
                                breedsList={cache.breeds || []}
                                countriesList={countriesList}
                                isSubmitting={isStep5Submitting}
                                setIsSubmitting={setIsStep5Submitting}
                            />
                        )}
                        {currentStep === 6 && <Step6Success speciesList={cache.species || []} breedsList={cache.breeds || []} />}

                        {/* Navigation Buttons */}
                        {currentStep < 6 && (
                            <div className="mt-12 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-8 border-t border-brand-color-03">
                                {/* Back — hidden on step 1, fully locked during submission */}
                                <Button
                                    variant="text"
                                    onClick={prevStep}
                                    disabled={currentStep === 1 || isStep5Submitting}
                                    className={`
                                        order-2 sm:order-1
                                        px-8 sm:px-12 py-4 rounded-2xl font-bold text-white text-base sm:text-lg transition-all duration-300
                                        bg-gradient-to-br from-gray-600/90 to-gray-700/90 backdrop-blur-xl border border-white/30
                                        shadow-[0_4px_20px_rgba(107,114,128,0.2)]
                                        hover:bg-gradient-to-br hover:from-gray-500/90 hover:to-gray-600/90 hover:shadow-[0_8px_30px_rgba(107,114,128,0.3)] hover:scale-[1.02] active:scale-95
                                        disabled:opacity-0 disabled:pointer-events-none
                                        ${currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}
                                    `}
                                >
                                    <ArrowLeft size={20} className="mr-2" />
                                    Back
                                </Button>

                                {/* Reset — locked during submission to prevent clearing mid-flight */}
                                <Button
                                    variant="text"
                                    onClick={resetForm}
                                    disabled={isStep5Submitting}
                                    className="order-3 sm:order-2 sm:ml-auto px-8 sm:px-12 py-4 rounded-2xl font-bold text-white text-base sm:text-lg transition-all duration-300 bg-gradient-to-br from-orange-400/90 to-orange-500/90 backdrop-blur-xl border border-white/30 shadow-[0_4px_20px_rgba(249,115,22,0.2)] hover:shadow-[0_8px_30px_rgba(249,115,22,0.3)] hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                                >
                                    <RotateCcw size={20} className="mr-2" />
                                    Reset
                                </Button>

                                {/* Continue / Submit — the pessimistic lock lives here */}
                                <Button
                                    onClick={handleContinue}
                                    disabled={currentStep === 5 && isStep5Submitting}
                                    className={`
                                        order-1 sm:order-3 px-8 sm:px-12 py-4 rounded-2xl font-bold text-white text-base sm:text-lg transition-all duration-300 backdrop-blur-xl border border-white/30
                                        disabled:cursor-not-allowed disabled:pointer-events-none
                                        ${currentStep === 5 && isStep5Submitting
                                            // Locked / processing state
                                            ? 'bg-gradient-to-br from-emerald-500/60 to-emerald-600/60 opacity-80 shadow-[0_4px_20px_rgba(16,185,129,0.1)] scale-[0.99]'
                                            : currentStep === 5
                                                // Ready-to-submit state
                                                ? 'bg-gradient-to-br from-emerald-500/90 to-emerald-600/90 shadow-[0_4px_20px_rgba(16,185,129,0.2)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95'
                                                // Normal continue state
                                                : 'bg-gradient-to-br from-blue-500/90 to-blue-600/90 shadow-[0_4px_20px_rgba(59,130,246,0.2)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.3)] hover:scale-[1.02] active:scale-95'
                                        }
                                    `}
                                >
                                    {currentStep === 5 && isStep5Submitting ? (
                                        // Processing state — spinner + reassuring copy
                                        <>
                                            <Loader2 size={20} className="mr-2 animate-spin" />
                                            Securing your enquiry...
                                        </>
                                    ) : currentStep === 5 ? (
                                        // Ready state
                                        <><Check size={20} className="mr-2" />Submit Enquiry</>
                                    ) : (
                                        // All other steps
                                        <><ArrowRight size={20} className="mr-2" />Continue</>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ElegantFooter />
        </div >
    );
}

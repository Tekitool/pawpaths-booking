'use client';

import React, { useRef } from 'react';
import Step1Travel from '@/components/booking/Step1Travel';
import Step2Pets from '@/components/booking/Step2Pets';
import Step3Services from '@/components/booking/Step3Services';
import Step4Documents from '@/components/booking/Step4Documents';
import Step5Review from '@/components/booking/Step5Review';
import Step6Success from '@/components/booking/Step6Success';
import useBookingStore from '@/lib/store/booking-store';
import Button from '@/components/ui/Button';
import { ArrowLeft, RotateCcw, ArrowRight, Check } from 'lucide-react';

import BookingHeader from '@/components/booking/BookingHeader';

export default function NewBookingPage() {
    const { currentStep, nextStep, prevStep, resetForm } = useBookingStore();
    const step5Ref = useRef(null);

    const handleContinue = () => {
        if (currentStep === 5 && step5Ref.current) {
            // On step 5, trigger the submit handler
            step5Ref.current.handleSubmit();
        } else {
            nextStep();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <BookingHeader />

            <div className="py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10 animate-pulse delay-1000"></div>

                <div className="max-w-4xl mx-auto">
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-3">Book Your Pet&apos;s Journey</h1>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-medium text-gray-600">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            Step {currentStep} of 5
                        </div>
                    </div>

                    {/* Premium Progress Bar */}
                    <div className="relative mb-16 px-4">
                        {/* Progress Bar Container */}
                        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_8px_32px_rgba(0,0,0,0.2)] p-1.5 relative h-5 w-full z-0">
                            {/* Track Background (Dark) */}
                            <div className="absolute inset-0 bg-gray-900/10 rounded-full"></div>

                            {/* Progress Fill */}
                            <div
                                className="h-full rounded-full relative transition-all duration-700 ease-out shadow-[0_2px_8px_rgba(255,107,107,0.4)] bg-gradient-to-r from-red-500 via-orange-400 via-amber-300 to-yellow-50"
                                style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
                            >
                                {/* Inner Glow */}
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-white/60 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                            </div>
                        </div>

                        {/* Steps Overlay */}
                        <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 px-4 flex justify-between pointer-events-none z-10">
                            {[1, 2, 3, 4, 5].map((step) => (
                                <div key={step} className="flex flex-col items-center relative">
                                    {/* Step Circle */}
                                    <div
                                        className={`
                                            w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-500 relative
                                            backdrop-blur-md shadow-lg pointer-events-auto
                                            ${step <= currentStep
                                                ? 'bg-orange-500 border-orange-300 text-white shadow-[0_0_20px_rgba(249,115,22,0.6)] scale-110'
                                                : 'bg-white/40 border-white/40 text-gray-600'
                                            }
                                        `}
                                    >
                                        {/* Glossy Effect */}
                                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/50 to-transparent rounded-t-full"></div>
                                        {step}
                                    </div>

                                    {/* Label */}
                                    <span className={`text-xs font-bold uppercase tracking-wider absolute -bottom-8 w-32 text-center transition-colors duration-300 ${step === currentStep
                                        ? 'text-orange-500'
                                        : step < currentStep
                                            ? 'text-[#4d341a]'
                                            : 'text-gray-400'
                                        }`}>
                                        {step === 1 && 'Travel'}
                                        {step === 2 && 'Pets'}
                                        {step === 3 && 'Services'}
                                        {step === 4 && 'Docs'}
                                        {step === 5 && 'Review'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-8 md:p-12 border border-white/50 relative overflow-hidden max-w-5xl mx-auto">
                    {/* Content Container */}
                    <div className="relative z-10">
                        {currentStep === 1 && <Step1Travel />}
                        {currentStep === 2 && <Step2Pets />}
                        {currentStep === 3 && <Step3Services />}
                        {currentStep === 4 && <Step4Documents />}
                        {currentStep === 5 && <Step5Review ref={step5Ref} />}
                        {currentStep === 6 && <Step6Success />}

                        {/* Navigation Buttons */}
                        {currentStep < 6 && (
                            <div className="mt-12 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-8 border-t border-gray-100/50">
                                <Button
                                    variant="text"
                                    onClick={prevStep}
                                    disabled={currentStep === 1}
                                    className={`
                                            px-8 sm:px-12 py-4 rounded-2xl font-bold text-white text-base sm:text-lg transition-all duration-300
                                            bg-gradient-to-br from-gray-600/90 to-gray-700/90 backdrop-blur-xl border border-white/30
                                            shadow-[0_4px_20px_rgba(107,114,128,0.2)]
                                            hover:bg-gradient-to-br hover:from-gray-500/90 hover:to-gray-600/90 hover:shadow-[0_8px_30px_rgba(107,114,128,0.3)] hover:scale-[1.02] active:scale-95
                                            ${currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}
                                        `}
                                >
                                    <ArrowLeft size={20} className="mr-2" />
                                    Back
                                </Button>

                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                                    <Button
                                        variant="text"
                                        onClick={resetForm}
                                        className="px-8 sm:px-12 py-4 rounded-2xl font-bold text-white text-base sm:text-lg transition-all duration-300 bg-gradient-to-br from-orange-400/90 to-orange-500/90 backdrop-blur-xl border border-white/30 shadow-[0_4px_20px_rgba(249,115,22,0.2)] hover:shadow-[0_8px_30px_rgba(249,115,22,0.3)] hover:scale-[1.02] active:scale-95"
                                    >
                                        <RotateCcw size={20} className="mr-2" />
                                        Reset
                                    </Button>
                                    <Button
                                        onClick={handleContinue}
                                        className="px-8 sm:px-12 py-4 rounded-2xl font-bold text-white text-base sm:text-lg transition-all duration-300 bg-gradient-to-br from-blue-500/90 to-blue-600/90 backdrop-blur-xl border border-white/30 shadow-[0_4px_20px_rgba(59,130,246,0.2)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.3)] hover:scale-[1.02] active:scale-95"
                                    >
                                        {currentStep === 5 ? (
                                            <><Check size={20} className="mr-2" />Confirm Booking</>
                                        ) : (
                                            <><ArrowRight size={20} className="mr-2" />Continue</>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

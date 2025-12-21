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
        <div className="min-h-screen bg-gray-50">
            <BookingHeader />

            <div className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-pawpaths-brown">Book Your Pet's Journey with Pawpaths</h1>
                        <p className="mt-2 text-gray-600">Step {currentStep} of 5</p>
                    </div>

                    {/* Progress Bar Placeholder */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                        <div className="bg-pawpaths-brown h-2.5 rounded-full transition-all duration-500" style={{ width: `${Math.min((currentStep / 5) * 100, 100)}%` }}></div>
                    </div>

                    <div className="flex justify-between text-xs sm:text-sm font-medium text-gray-500 mb-8 px-1">
                        <span className={`${currentStep >= 1 ? 'text-pawpaths-brown font-bold' : ''}`}>Travel Details</span>
                        <span className={`${currentStep >= 2 ? 'text-pawpaths-brown font-bold' : ''}`}>Pet Information</span>
                        <span className={`${currentStep >= 3 ? 'text-pawpaths-brown font-bold' : ''}`}>Services</span>
                        <span className={`${currentStep >= 4 ? 'text-pawpaths-brown font-bold' : ''}`}>Documents</span>
                        <span className={`${currentStep >= 5 ? 'text-pawpaths-brown font-bold' : ''}`}>Review</span>
                    </div>

                    <div className="bg-white shadow-level-1 rounded-md3-lg p-8 border border-gray-100">
                        {currentStep === 1 && <Step1Travel />}
                        {currentStep === 2 && <Step2Pets />}
                        {currentStep === 3 && <Step3Services />}
                        {currentStep === 4 && <Step4Documents />}
                        {currentStep === 5 && <Step5Review ref={step5Ref} />}
                        {currentStep === 6 && <Step6Success />}

                        {/* Navigation Buttons - Hide on Success Step */}
                        {currentStep < 6 && (
                            <div className="mt-8 flex justify-between pt-6 border-t border-gray-100">
                                <Button
                                    variant="outlined"
                                    onClick={prevStep}
                                    disabled={currentStep === 1}
                                    className="border-pawpaths-brown text-pawpaths-brown hover:bg-pawpaths-cream/10"
                                >
                                    Back
                                </Button>
                                <div className="flex gap-2">
                                    <Button
                                        variant="text"
                                        onClick={resetForm}
                                        className="bg-[#fff2b1] text-red-600 hover:bg-[#fff2b1]/80"
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        onClick={handleContinue}
                                        className="bg-pawpaths-brown hover:bg-secondary text-white shadow-level-2"
                                    >
                                        {currentStep === 5 ? 'Submit' : 'Continue'}
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

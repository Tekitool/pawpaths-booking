import Link from 'next/link';
import NavBar from '@/components/layouts/NavBar';
import Footer from '@/components/layouts/Footer';
import { Scale, FileText, CreditCard, ShieldAlert, Plane, HeartPulse, UserCheck, AlertCircle } from 'lucide-react';

export const metadata = {
    title: 'Terms of Service | Pawpaths',
    description: 'Terms and Conditions for Pawpaths Pets Relocation Services. Rules and regulations governing our pet transport services.',
};

const Section = ({ icon: Icon, title, children }) => (
    <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-brand-yellow/10 rounded-lg">
                <Icon className="w-6 h-6 text-brand-amber" />
            </div>
            <h2 className="text-2xl font-bold text-brand-brown" style={{ fontFamily: 'var(--font-baloo), sans-serif' }}>
                {title}
            </h2>
        </div>
        <div className="text-brand-taupe leading-relaxed space-y-4 text-sm sm:text-base text-justify">
            {children}
        </div>
    </section>
);

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen flex flex-col bg-surface-ivory">
            <NavBar />

            <main className="flex-1">
                {/* Hero section */}
                <section className="bg-brand-brown pt-20 pb-16 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1
                            className="text-white text-4xl sm:text-5xl font-bold mb-6"
                            style={{ fontFamily: 'var(--font-baloo), sans-serif' }}
                        >
                            Terms of Service
                        </h1>
                        <p className="text-white/70 text-lg max-w-2xl mx-auto">
                            Please read these terms carefully. They outline our commitment to your pet&apos;s safety and your responsibilities as a client.
                        </p>
                    </div>
                </section>

                {/* Content section */}
                <div className="max-w-4xl mx-auto px-4 py-20">
                    <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-soft border border-brand-brown/5">

                        <Section icon={Scale} title="1. Agreement to Terms">
                            <p>
                                By accessing our website and engaging Pawpaths Pets Relocation Services (&quot;Pawpaths&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you agree to be bound by these Terms of Service. These terms constitute a legally binding agreement between you and Pawpaths regarding the international and domestic relocation of your pets.
                            </p>
                        </Section>

                        <Section icon={UserCheck} title="2. Client Responsibilities">
                            <p>
                                The client is responsible for providing accurate and complete information regarding the pet&apos;s breed, age, size, weight, and medical history. Any delays or additional costs arising from inaccurate measurements or disclosure will be the sole responsibility of the client.
                            </p>
                            <p>
                                You must ensure that your pet is in good health and has all necessary vaccinations, microchips, and documentation required by both the origin and destination countries.
                            </p>
                        </Section>

                        <Section icon={CreditCard} title="3. Quotes, Fees, and Payments">
                            <p>
                                All quotes provided by Pawpaths are based on current airline rates, exchange rates, and government fees, which are subject to change without notice until final booking. Quotes are typically valid for 30 days.
                            </p>
                            <p>
                                A non-refundable deposit is required to initiate the relocation process. Full payment must be settled prior to the issuance of flight tickets or as specified in your service agreement.
                            </p>
                        </Section>

                        <Section icon={Plane} title="4. Flight Coordination and Delays">
                            <p>
                                While Pawpaths coordinates with premium airlines, we do not own or operate aircraft. We cannot be held liable for flight cancellations, delays, rerouting, or technical issues managed by the carrier.
                            </p>
                            <p>
                                In the event of a delay, Pawpaths will facilitate boarding or care arrangements, but any additional costs incurred (boarding fees, transport, vet checks) will be borne by the client.
                            </p>
                        </Section>

                        <Section icon={ShieldAlert} title="5. IATA Crate Requirements">
                            <p>
                                All pets must travel in IATA-compliant crates. If you provide your own crate, it must meet all current airline and IATA regulations. Pawpaths reserves the right to refuse transport if a crate is deemed unsafe or non-compliant, with any replacement costs charged to the client.
                            </p>
                        </Section>

                        <Section icon={HeartPulse} title="6. Pet Health and Fitness">
                            <p>
                                Pawpaths prioritizes the safety of your pet. We reserve the right to postpone or cancel travel if a veterinarian or airline staff deems the pet unfit for travel due to health or stress concerns.
                            </p>
                            <p>
                                Sedation of pets during air travel is strictly discouraged and often prohibited by airlines. Pawpaths will not be responsible for any adverse effects resulting from unauthorized sedation.
                            </p>
                        </Section>

                        <Section icon={FileText} title="7. Import/Export and Customs">
                            <p>
                                Pawpaths assists with documentation and customs clearing, but final approval relies on government authorities. We are not responsible for delays, quarantine extensions, or fines resulting from changes in government policy or the presence of restricted items/breeds.
                            </p>
                        </Section>

                        <Section icon={AlertCircle} title="8. Liability and Insurance">
                            <p>
                                Pawpaths takes every precaution to ensure a safe journey. However, the relocation of live animals carries inherent risks. Our liability is limited to the service fees paid to Pawpaths. We strongly recommend that clients obtain comprehensive pet travel insurance for additional peace of mind.
                            </p>
                        </Section>

                        <Section icon={Scale} title="9. Governing Law">
                            <p>
                                These terms are governed by and construed in accordance with the laws of the United Arab Emirates as applied in the Emirate of Dubai. Any disputes shall be subject to the exclusive jurisdiction of the Dubai courts.
                            </p>
                        </Section>

                        <div className="mt-12 pt-8 border-t border-brand-brown/10 text-center">
                            <p className="text-brand-taupe text-sm">
                                Last updated: March 2026<br />
                                For further clarification, please reach out to us at <a href="mailto:info@pawpathsae.com" className="text-brand-amber font-semibold">info@pawpathsae.com</a>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

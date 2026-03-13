import Link from 'next/link';
import NavBar from '@/components/layouts/NavBar';
import Footer from '@/components/layouts/Footer';
import { Shield, Lock, Eye, FileText, Database, UserCheck, Mail } from 'lucide-react';

export const metadata = {
    title: 'Privacy Policy | Pawpaths',
    description: 'Privacy Policy for Pawpaths Pets Relocation Services. Learn how we collect, use, and protect your personal data.',
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
        <div className="text-brand-taupe leading-relaxed space-y-4 text-sm sm:text-base">
            {children}
        </div>
    </section>
);

export default function PrivacyPolicyPage() {
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
                            Privacy Policy
                        </h1>
                        <p className="text-white/70 text-lg max-w-2xl mx-auto">
                            At Pawpaths, we are committed to protecting your privacy and ensuring your personal information is handled safely and responsibly.
                        </p>
                    </div>
                </section>

                {/* Content section */}
                <div className="max-w-4xl mx-auto px-4 py-20">
                    <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-soft border border-brand-brown/5">

                        <Section icon={UserCheck} title="Who we are">
                            <p>
                                Our website address is: <Link href="/" className="text-brand-amber hover:underline">https://pawpathsae.com/</Link>.
                                Pawpaths is a premium pet relocation service provider dedicated to safe and ethical pet transport.
                            </p>
                        </Section>

                        <Section icon={Eye} title="Data Collection">
                            <p>
                                When visitors leave comments on the site we collect the data shown in the comments form, and also the visitor’s IP address and browser user agent string to help spam detection.
                            </p>
                            <p>
                                An anonymized string created from your email address (also called a hash) may be provided to the Gravatar service to see if you are using it. The Gravatar service privacy policy is available here: https://automattic.com/privacy/. After approval of your comment, your profile picture is visible to the public in the context of your comment.
                            </p>
                        </Section>

                        <Section icon={FileText} title="Media">
                            <p>
                                If you upload images to the website, you should avoid uploading images with embedded location data (EXIF GPS) included. Visitors to the website can download and extract any location data from images on the website.
                            </p>
                        </Section>

                        <Section icon={Database} title="Cookies">
                            <p>
                                If you leave a comment on our site you may opt-in to saving your name, email address and website in cookies. These are for your convenience so that you do not have to fill in your details again when you leave another comment. These cookies will last for one year.
                            </p>
                            <p>
                                If you visit our login page, we will set a temporary cookie to determine if your browser accepts cookies. This cookie contains no personal data and is discarded when you close your browser.
                            </p>
                            <p>
                                When you log in, we will also set up several cookies to save your login information and your screen display choices. Login cookies last for two days, and screen options cookies last for a year. If you select “Remember Me”, your login will persist for two weeks.
                            </p>
                        </Section>

                        <Section icon={Lock} title="Embedded content from other websites">
                            <p>
                                Articles on this site may include embedded content (e.g. videos, images, articles, etc.). Embedded content from other websites behaves in the exact same way as if the visitor has visited the other website.
                            </p>
                            <p>
                                These websites may collect data about you, use cookies, embed additional third-party tracking, and monitor your interaction with that embedded content, including tracking your interaction with the embedded content if you have an account and are logged in to that website.
                            </p>
                        </Section>

                        <Section icon={Shield} title="Data Retention & Sharing">
                            <p>
                                <strong>Sharing:</strong> If you request a password reset, your IP address will be included in the reset email.
                            </p>
                            <p>
                                <strong>Retention:</strong> If you leave a comment, the comment and its metadata are retained indefinitely. For users that register on our website, we also store the personal information they provide in their user profile. All users can see, edit, or delete their personal information at any time.
                            </p>
                        </Section>

                        <Section icon={Mail} title="Your Rights">
                            <p>
                                If you have an account on this site, or have left comments, you can request to receive an exported file of the personal data we hold about you, including any data you have provided to us.
                            </p>
                            <p>
                                You can also request that we erase any personal data we hold about you. This does not include any data we are obliged to keep for administrative, legal, or security purposes.
                            </p>
                        </Section>

                        <div className="mt-12 pt-8 border-t border-brand-brown/10 text-center">
                            <p className="text-brand-taupe text-sm">
                                Last updated: March 2026<br />
                                If you have any questions, please contact us at <a href="mailto:info@pawpathsae.com" className="text-brand-amber font-semibold">info@pawpathsae.com</a>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

import Image from "next/image";
import BookingForm from "@/components/BookingForm";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header/Nav */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center" suppressHydrationWarning>
          <div className="flex items-center gap-2" suppressHydrationWarning>
            <div className="relative h-10 w-40">
              <Image
                src="/pplogo.svg"
                alt="Pawpaths Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/971586947755?text=Hi%20Pawpaths%2C%20I%20want%20to%20know%20more%20about%20your%20services.%20Please%20call%20me%20back%21"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-brand-color-01 font-semibold hover:text-[#3d2815]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#25D366]">
                <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
              </svg>
              <span className="hidden sm:block">+971 58 694 7755</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-brand-color-01 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pattern-dots"></div>
        <div className="container mx-auto px-4 relative z-10 text-center" suppressHydrationWarning>
          <h1 className="mb-6 leading-tight">
            Safe & Stress-Free <br />
            <span className="text-brand-color-02">Pet Relocation</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-10">
            We handle every detail of your pet&apos;s journey, ensuring they arrive safely and comfortably at their new home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center" suppressHydrationWarning>
            <a href="#booking-form" className="bg-brand-color-02 text-brand-color-01 font-bold py-3 px-8 rounded-full hover:bg-white transition-colors shadow-lg">
              Book Now
            </a>
            <a href="https://wa.me/971586947755" target="_blank" rel="noopener noreferrer" className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white/10 transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Booking Form Section */}
      <section id="booking-form" className="py-16 px-4 bg-brand-text-02/5 flex-grow">
        <div className="container mx-auto">
          <div className="text-center mb-12" suppressHydrationWarning>
            <h2 className="text-brand-color-01 mb-4">Start Your Booking</h2>
            <p className="text-brand-text-02 max-w-2xl mx-auto">
              Fill out the form below to request a quote or book a relocation service. Our team will review your details and get back to you shortly.
            </p>
          </div>

          <BookingForm />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center" suppressHydrationWarning>
            <div className="p-6 rounded-xl bg-brand-text-02/5">
              <div className="w-16 h-16 bg-brand-color-02 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-color-01" suppressHydrationWarning>
                <MapPin size={32} />
              </div>
              <h3 className="text-brand-color-01 mb-2">Global Network</h3>
              <p className="text-brand-text-02">Door-to-door service to over 50 countries worldwide.</p>
            </div>
            <div className="p-6 rounded-xl bg-brand-text-02/5">
              <div className="w-16 h-16 bg-brand-color-02 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-color-01">
                <div className="font-bold text-2xl">24/7</div>
              </div>
              <h3 className="text-brand-color-01 mb-2">Expert Care</h3>
              <p className="text-brand-text-02">Dedicated team of pet relocation specialists available round the clock.</p>
            </div>
            <div className="p-6 rounded-xl bg-brand-text-02/5">
              <div className="w-16 h-16 bg-brand-color-02 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-color-01">
                <Mail size={32} />
              </div>
              <h3 className="text-brand-color-01 mb-2">Updates</h3>
              <p className="text-brand-text-02">Regular photo and video updates throughout the journey.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-color-01 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="mb-4">Pawpaths</h3>
              <p className="text-brand-text-02/60">
                Professional pet relocation services ensuring safe and comfortable travel for your furry family members.
              </p>
            </div>
            <div>
              <h3 className="mb-4">Contact</h3>
              <ul className="space-y-2 text-brand-text-02/60">
                <li className="flex items-center gap-2">
                  <Phone size={16} />
                  <a href="tel:+971586947755" className="hover:text-white">+971 58 694 7755</a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={16} />
                  <a href="mailto:bookings@pawpathsae.com" className="hover:text-white">bookings@pawpathsae.com</a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin size={16} className="mt-1 flex-shrink-0" />
                  <span>Office No. 204, Arjumand Building,<br />Dubai Investment Park 1, Jebel Ali, Dubai</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4">Quick Links</h3>
              <ul className="space-y-2 text-brand-text-02/60">
                <li><a href="https://pawpathsae.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white">Home</a></li>
                <li><a href="#booking-form" className="hover:text-white">Book Now</a></li>
                <li><a href="https://pawpathsae.com/services" target="_blank" rel="noopener noreferrer" className="hover:text-white">Services</a></li>
                <li><a href="https://pawpathsae.com/aboutus" target="_blank" rel="noopener noreferrer" className="hover:text-white">About Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center text-brand-text-02/60 text-sm">
            <p>&copy; {new Date().getFullYear()} Pawpaths Pets Relocation Services. All rights reserved.</p>
            <p className="mt-2">Developed by <a href="https://tekitool.com" target="_blank" rel="noopener noreferrer" className="text-brand-color-02 hover:text-white transition-colors">Tekitool</a></p>
          </div>
        </div>
      </footer>
    </main>
  );
}

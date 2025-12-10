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
            <div className="relative h-10 w-auto aspect-[4/1]">
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
              className="flex items-center gap-2 text-pawpaths-brown font-semibold hover:text-[#3d2815]"
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
      <section className="bg-pawpaths-brown text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pattern-dots"></div>
        <div className="container mx-auto px-4 relative z-10 text-center" suppressHydrationWarning>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Safe & Stress-Free <br />
            <span className="text-pawpaths-cream">Pet Relocation</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-10">
            We handle every detail of your pet's journey, ensuring they arrive safely and comfortably at their new home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center" suppressHydrationWarning>
            <a href="#booking-form" className="bg-pawpaths-cream text-pawpaths-brown font-bold py-3 px-8 rounded-full hover:bg-white transition-colors shadow-lg">
              Book Now
            </a>
            <a href="https://wa.me/971586947755" target="_blank" rel="noopener noreferrer" className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white/10 transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Booking Form Section */}
      <section id="booking-form" className="py-16 px-4 bg-gray-50 flex-grow">
        <div className="container mx-auto">
          <div className="text-center mb-12" suppressHydrationWarning>
            <h2 className="text-3xl font-bold text-pawpaths-brown mb-4">Start Your Booking</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
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
            <div className="p-6 rounded-xl bg-gray-50">
              <div className="w-16 h-16 bg-pawpaths-cream rounded-full flex items-center justify-center mx-auto mb-4 text-pawpaths-brown" suppressHydrationWarning>
                <MapPin size={32} />
              </div>
              <h3 className="text-xl font-bold text-pawpaths-brown mb-2">Global Network</h3>
              <p className="text-gray-600">Door-to-door service to over 50 countries worldwide.</p>
            </div>
            <div className="p-6 rounded-xl bg-gray-50">
              <div className="w-16 h-16 bg-pawpaths-cream rounded-full flex items-center justify-center mx-auto mb-4 text-pawpaths-brown">
                <div className="font-bold text-2xl">24/7</div>
              </div>
              <h3 className="text-xl font-bold text-pawpaths-brown mb-2">Expert Care</h3>
              <p className="text-gray-600">Dedicated team of pet relocation specialists available round the clock.</p>
            </div>
            <div className="p-6 rounded-xl bg-gray-50">
              <div className="w-16 h-16 bg-pawpaths-cream rounded-full flex items-center justify-center mx-auto mb-4 text-pawpaths-brown">
                <Mail size={32} />
              </div>
              <h3 className="text-xl font-bold text-pawpaths-brown mb-2">Updates</h3>
              <p className="text-gray-600">Regular photo and video updates throughout the journey.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-pawpaths-brown text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Pawpaths</h3>
              <p className="text-gray-300">
                Professional pet relocation services ensuring safe and comfortable travel for your furry family members.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <Phone size={16} />
                  <a href="tel:+971586947755" className="hover:text-white">+971 58 694 7755</a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={16} />
                  <a href="mailto:bookings@pawpaths.com" className="hover:text-white">bookings@pawpaths.com</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white">Home</a></li>
                <li><a href="#booking-form" className="hover:text-white">Book Now</a></li>
                <li><a href="#" className="hover:text-white">Services</a></li>
                <li><a href="#" className="hover:text-white">About Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Pawpaths Pets Relocation Services. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

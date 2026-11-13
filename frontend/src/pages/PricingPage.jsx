import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PricingSection from '../components/PricingSection';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-between">
      <Navbar />

      <main className="pt-28 pb-20 flex-1 w-full">
        <PricingSection showSupportBanner={true} />
      </main>

      <Footer />
    </div>
  );
}

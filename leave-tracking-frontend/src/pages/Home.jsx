import React, { useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import WaveDivider from '../components/WaveDivider';
import TrustedBy from '../components/TrustedBy';
import Features from '../components/Features';
import ProductDemo from '../components/ProductDemo';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

/**
 * Home page component - Main landing page that combines all homepage sections
 * @param {Object} props - Component props
 * @param {Function} props.onSignIn - Callback for sign in button click
 * @param {Function} props.onGetStarted - Callback for get started button click
 * @param {Function} props.onBackToHome - Callback for back to home button click
 * @param {boolean} props.showBackButton - Whether to show back button instead of auth buttons
 */
const Home = ({ 
  onSignIn, 
  onGetStarted, 
  onBackToHome, 
  showBackButton = false 
}) => {
  // console.log('Home component rendering with props:', { onSignIn, onGetStarted, onBackToHome, showBackButton });
  
  // Scroll animation effect
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, observerOptions);

    const scrollElements = document.querySelectorAll('.scroll-animate');
    scrollElements.forEach((el) => observer.observe(el));

    return () => {
      scrollElements.forEach((el) => observer.unobserve(el));
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-white">
      <Header 
        onSignIn={onSignIn}
        onGetStarted={onGetStarted}
        onBackToHome={onBackToHome}
        showBackButton={showBackButton}
      />
      
      <main id="main-content" role="main">
        <Hero 
          onGetStarted={onGetStarted}
          onSeeDemo={() => {
            // Demo functionality - could open a modal or navigate to demo page
            console.log('Demo clicked');
            alert('Demo feature coming soon!');
          }}
        />
        
        <WaveDivider />
        <TrustedBy />
        
        <div className="bg-white py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Features />
          </div>
        </div>
        
        <ProductDemo />
        
        <CTA onButtonClick={onGetStarted} />
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;

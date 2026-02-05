import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Shield, Award, Leaf } from 'lucide-react';
import Button from '../common/Button';

const HeroSection = () => {
  const features = [
    { icon: Shield, text: 'Certified Lab-Grown' },
    { icon: Award, text: 'Premium Quality' },
    { icon: Leaf, text: 'Eco-Friendly' },
  ];

  return (
    <div className="relative bg-gradient-to-br from-primary-50 via-white to-blue-50 overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Ethically Sourced Lab-Grown Diamonds
            </div>

            {/* Main Heading */}
            <h1 className="font-display text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Your Perfect Ring,
              <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent"> Crafted with Care</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
              Design your dream engagement ring with our AI-powered configurator. 
              Choose from stunning lab-grown diamonds and exquisite settings.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Link to="/configurator">
                <Button size="lg" className="w-full sm:w-auto group">
                  Start Designing
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/diamonds">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Browse Diamonds
                </Button>
              </Link>
            </div>

            {/* Trust Features */}
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-center gap-2 text-gray-700">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Icon className="h-5 w-5 text-primary-600" />
                    </div>
                    <span className="text-sm font-medium">{feature.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right - Hero Image/Visual */}
          <div className="relative lg:h-[600px]">
            {/* Main Ring Image */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-400 to-blue-400 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 transform group-hover:scale-105 transition-transform duration-500">
                {/* Placeholder for ring image */}
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <Sparkles className="h-24 w-24 text-primary-400 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-500 font-medium">Featured Ring</p>
                    <p className="text-sm text-gray-400">1.5ct Round Brilliant</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Stats Cards */}
            <div className="absolute top-10 -left-4 bg-white rounded-xl shadow-lg p-4 animate-float">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">IGI Certified</p>
                  <p className="text-sm text-gray-500">100% Authentic</p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-10 -right-4 bg-white rounded-xl shadow-lg p-4 animate-float animation-delay-2000">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Leaf className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Eco-Friendly</p>
                  <p className="text-sm text-gray-500">Carbon Neutral</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 80C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;
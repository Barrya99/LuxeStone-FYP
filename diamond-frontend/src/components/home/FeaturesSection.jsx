// src/components/home/FeaturesSection.jsx
import { Sparkles, Shield, Truck, RefreshCw, MessageCircle, Award } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Configurator',
      description: 'Design your perfect ring with intelligent recommendations and real-time pricing.',
      color: 'primary',
    },
    {
      icon: Shield,
      title: 'IGI Certified Diamonds',
      description: 'Every diamond comes with an authentic certification from International Gemological Institute.',
      color: 'blue',
    },
    {
      icon: Truck,
      title: 'Free Insured Shipping',
      description: 'Complimentary shipping with full insurance coverage on all orders.',
      color: 'green',
    },
    {
      icon: RefreshCw,
      title: '30-Day Returns',
      description: 'Not completely satisfied? Return within 30 days for a full refund, no questions asked.',
      color: 'purple',
    },
    {
      icon: MessageCircle,
      title: '24/7 Expert Support',
      description: 'Our diamond experts are available around the clock to answer your questions.',
      color: 'amber',
    },
    {
      icon: Award,
      title: 'Lifetime Warranty',
      description: 'Every ring includes a lifetime warranty covering manufacturing defects.',
      color: 'red',
    },
  ];

  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Why Choose LuxeStone?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the perfect blend of cutting-edge technology, ethical sourcing, 
            and exceptional customer service.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-8 rounded-2xl border border-gray-200 hover:border-primary-300 hover:shadow-xl transition-all duration-300 bg-white"
              >
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl ${colorClasses[feature.color]} mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-7 w-7" />
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Trust Banner */}
        <div className="mt-16 bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl p-8 text-center text-white">
          <div className="max-w-3xl mx-auto">
            <h3 className="font-display text-2xl lg:text-3xl font-bold mb-3">
              Trusted by Over 10,000+ Happy Couples
            </h3>
            <p className="text-primary-100 text-lg mb-6">
              Join thousands who've found their perfect ring with LuxeStone
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div>
                <div className="text-4xl font-bold">4.9/5</div>
                <div className="text-primary-100 text-sm">Average Rating</div>
              </div>
              <div className="hidden sm:block w-px bg-primary-400" />
              <div>
                <div className="text-4xl font-bold">10K+</div>
                <div className="text-primary-100 text-sm">Happy Customers</div>
              </div>
              <div className="hidden sm:block w-px bg-primary-400" />
              <div>
                <div className="text-4xl font-bold">100%</div>
                <div className="text-primary-100 text-sm">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
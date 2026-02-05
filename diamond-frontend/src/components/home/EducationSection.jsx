import { BookOpen, Video, MessageCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import { useChatbotStore } from '../../store/useChatbotStore';

const EducationSection = () => {
  const { openChatbot } = useChatbotStore();
  
  const resources = [
    {
      icon: BookOpen,
      title: 'Understanding the 4Cs',
      description: 'Learn about Cut, Carat, Color, and Clarity - the four essential characteristics that determine diamond quality and value.',
      link: '/education/4cs',
      color: 'blue',
    },
    {
      icon: Video,
      title: 'Lab-Grown vs Natural',
      description: 'Discover the science behind lab-grown diamonds and why they\'re identical to natural diamonds in every way.',
      link: '/education/lab-grown',
      color: 'green',
    },
    {
      icon: MessageCircle,
      title: 'Ring Size Guide',
      description: 'Find your perfect fit with our comprehensive ring sizing guide and measurement tips.',
      link: '/size-guide',
      color: 'purple',
    },
  ];

  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-pink-500',
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Diamond Education
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empower yourself with knowledge before making your purchase
          </p>
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {resources.map((resource, index) => {
            const Icon = resource.icon;
            return (
              <Link
                key={index}
                to={resource.link}
                className="group relative bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[resource.color]} opacity-0 group-hover:opacity-5 transition-opacity`} />
                
                {/* Icon */}
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${colorClasses[resource.color]} text-white mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-8 w-8" />
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                  {resource.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {resource.description}
                </p>
                
                {/* Arrow */}
                <div className="flex items-center text-primary-600 font-medium group-hover:gap-2 transition-all">
                  <span>Learn More</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-12 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }} />
          </div>

          <div className="relative max-w-4xl mx-auto text-center">
            <h3 className="font-display text-3xl lg:text-4xl font-bold text-white mb-4">
              Still Have Questions?
            </h3>
            <p className="text-gray-300 text-lg mb-8">
              Our diamond experts are here to help you make the perfect choice
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" variant="primary">
                  Talk to an Expert
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="secondary" 
                className="bg-white text-gray-900 hover:bg-gray-100"
                onClick={openChatbot}
              >
                Try Our AI Assistant
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EducationSection;
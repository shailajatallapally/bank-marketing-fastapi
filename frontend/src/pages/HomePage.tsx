import React from 'react';
import { PageId } from '../types';
import bankHeroImage from '../assets/images/bank_marketing_hero_1789730777909.jpg';
import {
  Target,
  TrendingUp,
  Users,
  BarChart3,
  ArrowRight,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: PageId) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [imgSrc, setImgSrc] = React.useState<string>(bankHeroImage || '/bank_marketing_hero.jpg');

  const heroFeatures = [
    {
      id: 'predict',
      label: 'Predict Deposit',
      icon: <Target className="w-5 h-5 text-emerald-400" />,
      boxBg: 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-400',
      target: 'predict' as PageId,
    },
    {
      id: 'forecast',
      label: 'Campaign Forecast',
      icon: <TrendingUp className="w-5 h-5 text-blue-400" />,
      boxBg: 'bg-blue-500/10 border-blue-500/30 hover:border-blue-400',
      target: 'forecast' as PageId,
    },
    {
      id: 'segmentation',
      label: 'Customer Groups',
      icon: <Users className="w-5 h-5 text-purple-400" />,
      boxBg: 'bg-purple-500/10 border-purple-500/30 hover:border-purple-400',
      target: 'dashboard' as PageId,
    },
    {
      id: 'decisions',
      label: 'Smart Decisions',
      icon: <BarChart3 className="w-5 h-5 text-cyan-400" />,
      boxBg: 'bg-cyan-500/10 border-cyan-500/30 hover:border-cyan-400',
      target: 'about' as PageId,
    },
  ];

  const featureCards = [
    {
      title: 'Predict Deposit',
      description: 'Predict term deposit subscriptions using machine learning.',
      icon: <Target className="w-5 h-5 text-emerald-400" />,
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      target: 'predict' as PageId,
      actionText: 'Launch Predictor',
    },
    {
      title: 'Campaign Forecast',
      description: 'Forecast campaign trends over future periods.',
      icon: <TrendingUp className="w-5 h-5 text-blue-400" />,
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      target: 'forecast' as PageId,
      actionText: 'View Forecast',
    },
    {
      title: 'Customer Groups',
      description: 'Identify customer groups using your customer dataset.',
      icon: <Users className="w-5 h-5 text-purple-400" />,
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      target: 'dashboard' as PageId,
      actionText: 'Explore Groups',
    },
    {
      title: 'Smart Decisions',
      description: 'Turn customer insights into meaningful opportunities.',
      icon: <BarChart3 className="w-5 h-5 text-cyan-400" />,
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      target: 'about' as PageId,
      actionText: 'Learn More',
    },
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/95 via-[#0c1427] to-slate-950 border border-slate-800/90 p-6 sm:p-10 lg:p-12 shadow-2xl">
        {/* Subtle ambient lighting */}
        <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 -mb-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column (approx 60% on desktop) */}
          <div className="md:col-span-7 space-y-5 lg:space-y-6">
            {/* Green Eyebrow Text */}
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-widest text-emerald-400 uppercase">
                DATA DRIVEN BANKING
              </span>
            </div>

            {/* Large Modern Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-[3rem] font-extrabold text-slate-100 tracking-tight leading-[1.15]">
              Bank Marketing Prediction &amp; Forecast
            </h1>

            {/* Short Description */}
            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Predict term deposit subscriptions, understand customer groups, and forecast campaign trends using your banking information.
            </p>

            {/* 4 Small Feature Items/Icons in a Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {heroFeatures.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.target)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/70 border transition-all text-center group cursor-pointer focus:outline-none shadow-sm hover:scale-[1.02]"
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center border mb-2 transition-colors ${item.boxBg}`}
                  >
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-medium text-slate-200 group-hover:text-emerald-300 leading-tight transition-colors">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Action Row: Get Started Button + Subtext */}
            <div className="pt-3 flex flex-col sm:flex-row sm:items-center gap-4">
              <button
                id="hero-get-started-btn"
                onClick={() => onNavigate('predict')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.02] cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 font-bold" />
              </button>

              <span className="text-xs text-slate-400 tracking-normal">
                Turning Customer Insights into Meaningful Opportunities
              </span>
            </div>
          </div>

          {/* Right Column: Bank Marketing Illustration (~38% of hero content area, max-w 420px, height: auto) */}
          <div className="md:col-span-5 flex items-center justify-center md:justify-end">
            <div className="w-full max-w-[420px] rounded-2xl overflow-hidden border border-slate-800/90 bg-slate-950 shadow-2xl relative flex-shrink-0 group">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-blue-500/10 pointer-events-none z-10" />
              <img
                src={imgSrc}
                onError={() => setImgSrc('/bank_marketing_hero.jpg')}
                alt="Bank Marketing Prediction and Analytics Overview"
                className="w-full h-auto object-cover object-center rounded-2xl transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section (Four-column layout on desktop) */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featureCards.map((card, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-md group"
            >
              <div>
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border mb-3 ${card.iconBg}`}
                >
                  {card.icon}
                </div>
                <h3 className="text-sm font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors mb-1.5">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-800/80">
                <button
                  onClick={() => onNavigate(card.target)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  <span>{card.actionText}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Professional Banner */}
      <section className="rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/20 p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
          <div className="flex items-center gap-2 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-200 tracking-wide">
            Smarter Marketing <span className="text-emerald-400 mx-2 font-bold">•</span> Stronger Customer Relationships <span className="text-emerald-400 mx-2 font-bold">•</span> Greater Growth
          </p>
        </div>
      </section>
    </div>
  );
};

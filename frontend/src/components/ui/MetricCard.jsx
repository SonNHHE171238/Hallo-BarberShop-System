import React from 'react';

const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendDirection = 'up',
  isHighlight = false,
  className = "" 
}) => {
  return (
    <div className={`bg-surface-container-low border border-outline-gold rounded p-container-padding flex flex-col gap-4 relative overflow-hidden group ${isHighlight ? 'hover:border-primary' : ''} transition-colors ${className}`}>
      {isHighlight && (
        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 transition-all duration-300 group-hover:bg-primary"></div>
      )}
      
      <div className={`flex justify-between items-center ${isHighlight ? 'text-gold-dim' : 'text-on-surface-variant'}`}>
        <span className="font-label-md text-label-md uppercase tracking-widest group-hover:text-primary transition-colors">{title}</span>
        <span className={`material-symbols-outlined ${isHighlight ? 'text-primary' : ''}`} style={isHighlight ? { fontVariationSettings: "'FILL' 1" } : {}}>{icon}</span>
      </div>

      <div className="flex items-baseline gap-4">
        <div className={`font-display-lg text-headline-lg-mobile md:text-headline-lg serif-heading ${isHighlight ? 'text-primary' : 'text-on-surface'}`}>
          {value}
        </div>
        
        {trend && (
          <span className={`font-label-md text-[12px] flex items-center px-2 py-0.5 rounded border ${
            trendDirection === 'up' 
              ? 'text-primary bg-primary/10 border-primary/20' 
              : trendDirection === 'down'
                ? 'text-error bg-error/10 border-error/20'
                : 'text-outline bg-surface-variant border-outline-gold/30'
          }`}>
            <span className="material-symbols-outlined text-[14px] mr-1">
              {trendDirection === 'up' ? 'arrow_upward' : trendDirection === 'down' ? 'arrow_downward' : 'horizontal_rule'}
            </span>
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <div className="font-body-md text-body-md text-outline">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default MetricCard;


import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SentimentBadgeProps {
    sentiment: 'Bullish' | 'Bearish' | 'Neutral';
    size?: 'sm' | 'md' | 'lg';
}

export default function SentimentBadge({ sentiment, size = 'md' }: SentimentBadgeProps) {
    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base'
    };

    const sentimentConfig = {
        Bullish: {
            bg: 'bg-green-50',
            text: 'text-green-700',
            border: 'border-green-200',
            icon: TrendingUp,
            label: 'Alcista'
        },
        Bearish: {
            bg: 'bg-red-50',
            text: 'text-red-700',
            border: 'border-red-200',
            icon: TrendingDown,
            label: 'Bajista'
        },
        Neutral: {
            bg: 'bg-slate-50',
            text: 'text-slate-700',
            border: 'border-slate-200',
            icon: Minus,
            label: 'Neutral'
        }
    };

    const config = sentimentConfig[sentiment];
    const Icon = config.icon;

    return (
        <div
            className={`
        inline-flex items-center gap-1.5 rounded border
        ${sizeClasses[size]}
        ${config.bg} ${config.text} ${config.border}
        font-medium transition-all duration-200
      `}
        >
            <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} />
            <span>{config.label}</span>
        </div>
    );
}

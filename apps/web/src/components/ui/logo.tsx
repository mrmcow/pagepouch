import React from 'react'

interface LogoProps {
  size?: number
  className?: string
  showText?: boolean
}

export function Logo({ size = 48, className = '', showText = true }: LogoProps) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="relative">
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 48 48" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm"
        >
          <defs>
            <filter id={`emboss-${size}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0.5" dy="0.5" stdDeviation="0.3" floodColor="#1d4ed8" floodOpacity="0.3"/>
            </filter>
          </defs>
          {/* Main document */}
          <path 
            d="M9 6C9 4.89543 9.89543 4 11 4H35C36.1046 4 37 4.89543 37 6V40C37 41.1046 36.1046 42 35 42H11C9.89543 42 9 41.1046 9 40V6Z" 
            fill="#f8fafc" 
            stroke="#2563eb" 
            strokeWidth="2"
          />
          {/* Paperclip */}
          <path 
            d="M37 6V18L42 13V8C42 6.89543 41.1046 6 40 6H37Z" 
            fill="#2563eb" 
            stroke="#2563eb" 
            strokeWidth="2" 
            strokeLinejoin="round"
          />
          {/* Paperclip detail */}
          <path 
            d="M38.5 9.5V15.5M38.5 9.5H40C40.5523 9.5 41 9.94772 41 10.5V11.5C41 12.0523 40.5523 12.5 40 12.5H38.5M38.5 9.5V12.5" 
            stroke="#ffffff" 
            strokeWidth="1" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            filter={`url(#emboss-${size})`}
          />
          {/* Document lines */}
          <rect x="15" y="14" width="14" height="1.5" rx="0.75" fill="#64748b" opacity="0.3"/>
          <rect x="15" y="18" width="10" height="1.5" rx="0.75" fill="#64748b" opacity="0.3"/>
          <rect x="15" y="22" width="12" height="1.5" rx="0.75" fill="#64748b" opacity="0.3"/>
        </svg>
      </div>
      {showText && (
        <span 
          className="font-bold tracking-tight text-foreground" 
          style={{ fontSize: `${size * 0.4}px` }}
        >
          PagePouch
        </span>
      )}
    </div>
  )
}

export function LogoIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return <Logo size={size} className={className} showText={false} />
}

export function LogoWithText({ size = 48, className = '' }: { size?: number; className?: string }) {
  return <Logo size={size} className={className} showText={true} />
}

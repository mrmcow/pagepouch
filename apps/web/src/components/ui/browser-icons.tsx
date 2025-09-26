import React from 'react'

interface BrowserIconProps {
  size?: number
  className?: string
}

// Official Google Chrome icon (February 2022) - Updated with accurate colors and design
export function ChromeIcon({ size = 24, className = '' }: BrowserIconProps) {
  // Use a stable ID based on size to avoid hydration mismatches
  const uniqueId = `chrome-${size}`
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 512 512" 
      className={className}
    >
      <defs>
        {/* Chrome gradients - official colors */}
        <linearGradient id={`${uniqueId}-red`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EA4335"/>
          <stop offset="100%" stopColor="#D33B2C"/>
        </linearGradient>
        <linearGradient id={`${uniqueId}-green`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#34A853"/>
          <stop offset="100%" stopColor="#137333"/>
        </linearGradient>
        <linearGradient id={`${uniqueId}-yellow`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FBBC04"/>
          <stop offset="100%" stopColor="#F9AB00"/>
        </linearGradient>
        <radialGradient id={`${uniqueId}-blue`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4285F4"/>
          <stop offset="100%" stopColor="#1A73E8"/>
        </radialGradient>
      </defs>
      
      {/* Outer circle background */}
      <circle cx="256" cy="256" r="256" fill="#ffffff"/>
      
      {/* Red segment (top right) */}
      <path d="M 256,56 A 200,200 0 0,1 429.205,156 L 256,256 z" fill={`url(#${uniqueId}-red)`}/>
      
      {/* Yellow segment (bottom right) */}
      <path d="M 429.205,156 A 200,200 0 0,1 429.205,356 L 256,256 z" fill={`url(#${uniqueId}-yellow)`}/>
      
      {/* Green segment (left) */}
      <path d="M 429.205,356 A 200,200 0 0,1 82.795,356 L 256,256 z" fill={`url(#${uniqueId}-green)`}/>
      
      {/* Green segment continuation (top left) */}
      <path d="M 82.795,356 A 200,200 0 0,1 82.795,156 L 256,256 z" fill={`url(#${uniqueId}-green)`}/>
      
      {/* Green segment final (back to top) */}
      <path d="M 82.795,156 A 200,200 0 0,1 256,56 L 256,256 z" fill={`url(#${uniqueId}-green)`}/>
      
      {/* White center circle - the signature Chrome element */}
      <circle cx="256" cy="256" r="100" fill="#ffffff"/>
      
      {/* Blue center circle */}
      <circle cx="256" cy="256" r="75" fill={`url(#${uniqueId}-blue)`}/>
    </svg>
  )
}

// Official Firefox logo (2019)
export function FirefoxIcon({ size = 24, className = '' }: BrowserIconProps) {
  // Use a stable ID based on size to avoid hydration mismatches
  const uniqueId = `firefox-${size}`
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 512 512" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={`${uniqueId}-g`} cx="210%" cy="-100%" r="290%">
          <stop offset=".1" stopColor="#ffe226"/>
          <stop offset=".79" stopColor="#ff7139"/>
        </radialGradient>
        <radialGradient id={`${uniqueId}-c`} cx="49%" cy="40%" r="128%" gradientTransform="matrix(.82 0 0 1 .088 0)">
          <stop offset=".3" stopColor="#960e18"/>
          <stop offset=".35" stopColor="#b11927" stopOpacity=".74"/>
          <stop offset=".43" stopColor="#db293d" stopOpacity=".34"/>
          <stop offset=".5" stopColor="#f5334b" stopOpacity=".09"/>
          <stop offset=".53" stopColor="#ff3750" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id={`${uniqueId}-d`} cx="48%" cy="-12%" r="140%">
          <stop offset=".13" stopColor="#fff44f"/>
          <stop offset=".53" stopColor="#ff980e"/>
        </radialGradient>
        <radialGradient id={`${uniqueId}-e`} cx="22.76%" cy="110.11%" r="100%">
          <stop offset=".35" stopColor="#3a8ee6"/>
          <stop offset=".67" stopColor="#9059ff"/>
          <stop offset="1" stopColor="#c139e6"/>
        </radialGradient>
        <radialGradient id={`${uniqueId}-f`} cx="52%" cy="33%" r="59%" gradientTransform="scale(.9 1)">
          <stop offset=".21" stopColor="#9059ff" stopOpacity="0"/>
          <stop offset=".97" stopColor="#6e008b" stopOpacity=".6"/>
        </radialGradient>
        <radialGradient id={`${uniqueId}-b`} cx="87.4%" cy="-12.9%" r="128%" gradientTransform="matrix(.8 0 0 1 .178 .129)">
          <stop offset=".13" stopColor="#ffbd4f"/>
          <stop offset=".28" stopColor="#ff980e"/>
          <stop offset=".47" stopColor="#ff3750"/>
          <stop offset=".78" stopColor="#eb0878"/>
          <stop offset=".86" stopColor="#e50080"/>
        </radialGradient>
        <radialGradient id={`${uniqueId}-h`} cx="84%" cy="-41%" r="180%">
          <stop offset=".11" stopColor="#fff44f"/>
          <stop offset=".46" stopColor="#ff980e"/>
          <stop offset=".72" stopColor="#ff3647"/>
          <stop offset=".9" stopColor="#e31587"/>
        </radialGradient>
        <radialGradient id={`${uniqueId}-i`} cx="16.1%" cy="-18.6%" r="348.8%" gradientTransform="scale(1 .47) rotate(84 .279 -.297)">
          <stop offset="0" stopColor="#fff44f"/>
          <stop offset=".3" stopColor="#ff980e"/>
          <stop offset=".57" stopColor="#ff3647"/>
          <stop offset=".74" stopColor="#e31587"/>
        </radialGradient>
        <radialGradient id={`${uniqueId}-j`} cx="18.9%" cy="-42.5%" r="238.4%">
          <stop offset=".14" stopColor="#fff44f"/>
          <stop offset=".48" stopColor="#ff980e"/>
          <stop offset=".66" stopColor="#ff3647"/>
          <stop offset=".9" stopColor="#e31587"/>
        </radialGradient>
        <radialGradient id={`${uniqueId}-k`} cx="159.3%" cy="-44.72%" r="313.1%">
          <stop offset=".09" stopColor="#fff44f"/>
          <stop offset=".63" stopColor="#ff980e"/>
        </radialGradient>
        <linearGradient id={`${uniqueId}-a`} x1="87.25%" y1="15.5%" x2="9.4%" y2="93.1%">
          <stop offset=".05" stopColor="#fff44f"/>
          <stop offset=".37" stopColor="#ff980e"/>
          <stop offset=".53" stopColor="#ff3647"/>
          <stop offset=".7" stopColor="#e31587"/>
        </linearGradient>
        <linearGradient id={`${uniqueId}-l`} x1="80%" y1="14%" x2="18%" y2="84%">
          <stop offset=".17" stopColor="#fff44f" stopOpacity=".8"/>
          <stop offset=".6" stopColor="#fff44f" stopOpacity="0"/>
        </linearGradient>
      </defs>
      
      {/* Main Firefox body */}
      <path d="M478.711 166.353c-10.445-25.124-31.6-52.248-48.212-60.821 13.52 26.505 21.345 53.093 24.335 72.936 0 .039.015.136.047.4C427.706 111.135 381.627 83.823 344 24.355c-1.9-3.007-3.805-6.022-5.661-9.2a73.716 73.716 0 01-2.646-4.972A43.7 43.7 0 01332.1.677a.626.626 0 00-.546-.644.818.818 0 00-.451 0c-.034.012-.084.051-.12.065-.053.021-.12.069-.176.1.027-.036.083-.117.1-.136-60.37 35.356-80.85 100.761-82.732 133.484a120.249 120.249 0 00-66.142 25.488 71.355 71.355 0 00-6.225-4.7 111.338 111.338 0 01-.674-58.732c-24.688 11.241-43.89 29.01-57.85 44.7h-.111c-9.527-12.067-8.855-51.873-8.312-60.184-.114-.515-7.107 3.63-8.023 4.255a175.073 175.073 0 00-23.486 20.12 210.478 210.478 0 00-22.442 26.913c0 .012-.007.026-.011.038 0-.013.007-.026.011-.038a202.838 202.838 0 00-32.247 72.805c-.115.521-.212 1.061-.324 1.586-.452 2.116-2.08 12.7-2.365 15-.022.177-.032.347-.053.524a229.066 229.066 0 00-3.9 33.157c0 .41-.025.816-.025 1.227C16 388.418 123.6 496 256.324 496c118.865 0 217.56-86.288 236.882-199.63.407-3.076.733-6.168 1.092-9.271 4.777-41.21-.53-84.525-15.587-120.746z" fill={`url(#${uniqueId}-a)`}/>
      
      {/* Firefox head details */}
      <path d="M256.772 209.514c-.393 5.978-21.514 26.593-28.9 26.593-68.339 0-79.432 41.335-79.432 41.335 3.027 34.81 27.261 63.475 56.611 78.643 1.339.692 2.694 1.317 4.05 1.935a132.768 132.768 0 007.059 2.886 106.743 106.743 0 0031.271 6.031c119.78 5.618 142.986-143.194 56.545-186.408 22.137-3.85 45.115 5.053 57.947 14.067-21.012-36.714-60.25-61.484-105.3-61.484-2.85 0-5.641.235-8.442.429a120.249 120.249 0 00-66.142 25.488c3.664 3.1 7.8 7.244 16.514 15.828 16.302 16.067 58.13 32.705 58.219 34.657z" fill={`url(#${uniqueId}-e)`}/>
    </svg>
  )
}

// Legacy BrowserIcon component for backward compatibility
export function BrowserIcon({ size = 32, className = '' }: BrowserIconProps) {
  return <ChromeIcon size={size} className={className} />
}
"use client";

import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  
  return (
    <footer className="w-full border-t border-border pt-3">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-foreground opacity-70">
            {/* &copy; {new Date().getFullYear()} */}
          </div>
          
          <div className="flex items-center gap-6">
            <Link
              href="https://t.me/Fasad_Salatov"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative"
              onMouseEnter={() => setHoveredIcon('telegram')}
              onMouseLeave={() => setHoveredIcon(null)}
            >
              <div className={`absolute -inset-2 bg-primary/10 rounded-full blur-md transition-opacity duration-300 ${hoveredIcon === 'telegram' ? 'opacity-100' : 'opacity-0'}`}></div>
              <div className="relative flex flex-col items-center transition-transform duration-300 group-hover:-translate-y-1">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className={`text-primary transition-all duration-300 ${hoveredIcon === 'telegram' ? 'animate-pulse' : ''}`}
                >
                  <path d="m22 2-7 20-4-9-9-4Z"></path>
                  <path d="M22 2 11 13"></path>
                </svg>
                <span className={`text-xs mt-1 text-foreground opacity-70 transition-opacity duration-300 ${hoveredIcon === 'telegram' ? 'opacity-100' : 'opacity-0'}`}>
                  @Fasad_Salatov
                </span>
              </div>
            </Link>
            
            <Link
              href="https://github.com/FasadSalatov"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative"
              onMouseEnter={() => setHoveredIcon('github')}
              onMouseLeave={() => setHoveredIcon(null)}
            >
              <div className={`absolute -inset-2 bg-primary/10 rounded-full blur-md transition-opacity duration-300 ${hoveredIcon === 'github' ? 'opacity-100' : 'opacity-0'}`}></div>
              <div className="relative flex flex-col items-center transition-transform duration-300 group-hover:-translate-y-1">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className={`text-primary transition-all duration-300 ${hoveredIcon === 'github' ? 'animate-pulse' : ''}`}
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                  <path d="M9 18c-4.51 2-5-2-7-2"></path>
                </svg>
                <span className={`text-xs mt-1 text-foreground opacity-70 transition-opacity duration-300 ${hoveredIcon === 'github' ? 'opacity-100' : 'opacity-0'}`}>
                  FasadSalatov
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 
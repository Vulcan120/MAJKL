'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface TubeLineTheme {
  id: string;
  name: string;
  displayName: string;
  color: string;
  textColor: string;
  unlocked: boolean;
  description: string;
}

export const tubeLineThemes: TubeLineTheme[] = [
  {
    id: 'default',
    name: 'Default',
    displayName: 'TubeHacks Original',
    color: '#FF6B6B',
    textColor: '#FFFFFF',
    unlocked: true,
    description: 'The original TubeHacks theme'
  },
  {
    id: 'central',
    name: 'Central',
    displayName: 'Central Line',
    color: '#E32017',
    textColor: '#FFFFFF',
    unlocked: true, // Set to true for now, will be based on completion later
    description: 'Bold red like the Central line'
  },
  {
    id: 'piccadilly',
    name: 'Piccadilly',
    displayName: 'Piccadilly Line',
    color: '#003688',
    textColor: '#FFFFFF',
    unlocked: true,
    description: 'Deep blue of the Piccadilly line'
  },
  {
    id: 'district',
    name: 'District',
    displayName: 'District Line',
    color: '#00782A',
    textColor: '#FFFFFF',
    unlocked: true,
    description: 'Classic green of the District line'
  },
  {
    id: 'circle',
    name: 'Circle',
    displayName: 'Circle Line',
    color: '#FFD300',
    textColor: '#000000',
    unlocked: true,
    description: 'Bright yellow of the Circle line'
  },
  {
    id: 'metropolitan',
    name: 'Metropolitan',
    displayName: 'Metropolitan Line',
    color: '#9B0056',
    textColor: '#FFFFFF',
    unlocked: true,
    description: 'Magenta of the Metropolitan line'
  },
  {
    id: 'bakerloo',
    name: 'Bakerloo',
    displayName: 'Bakerloo Line',
    color: '#B36305',
    textColor: '#FFFFFF',
    unlocked: true,
    description: 'Warm brown of the Bakerloo line'
  },
  {
    id: 'victoria',
    name: 'Victoria',
    displayName: 'Victoria Line',
    color: '#0098D4',
    textColor: '#FFFFFF',
    unlocked: true,
    description: 'Light blue of the Victoria line'
  },
  {
    id: 'jubilee',
    name: 'Jubilee',
    displayName: 'Jubilee Line',
    color: '#A0A5A9',
    textColor: '#000000',
    unlocked: true,
    description: 'Silver grey of the Jubilee line'
  },
  {
    id: 'northern',
    name: 'Northern',
    displayName: 'Northern Line',
    color: '#000000',
    textColor: '#FFFFFF',
    unlocked: true,
    description: 'Sleek black of the Northern line'
  },
  {
    id: 'hammersmith',
    name: 'Hammersmith',
    displayName: 'Hammersmith & City',
    color: '#F3A9BB',
    textColor: '#000000',
    unlocked: true,
    description: 'Pink of the Hammersmith & City line'
  },
  {
    id: 'elizabeth',
    name: 'Elizabeth',
    displayName: 'Elizabeth Line',
    color: '#7156A5',
    textColor: '#FFFFFF',
    unlocked: true,
    description: 'Purple of the newest Elizabeth line'
  }
];

interface TubeThemeContextType {
  currentTheme: TubeLineTheme;
  setTheme: (themeId: string) => void;
  availableThemes: TubeLineTheme[];
}

const TubeThemeContext = createContext<TubeThemeContextType | undefined>(undefined);

export function TubeThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentThemeId, setCurrentThemeId] = useState('default');

  const currentTheme = tubeLineThemes.find(theme => theme.id === currentThemeId) || tubeLineThemes[0];

  const setTheme = (themeId: string) => {
    const theme = tubeLineThemes.find(t => t.id === themeId);
    if (theme && theme.unlocked) {
      setCurrentThemeId(themeId);
      localStorage.setItem('tubeTheme', themeId);
      
      // Apply CSS custom properties for the theme
      document.documentElement.style.setProperty('--tube-primary', theme.color);
      document.documentElement.style.setProperty('--tube-primary-text', theme.textColor);
    }
  };

  useEffect(() => {
    // Load saved theme
    const savedTheme = localStorage.getItem('tubeTheme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme('default');
    }
  }, []);

  return (
    <TubeThemeContext.Provider 
      value={{ 
        currentTheme, 
        setTheme, 
        availableThemes: tubeLineThemes 
      }}
    >
      {children}
    </TubeThemeContext.Provider>
  );
}

export function useTubeTheme() {
  const context = useContext(TubeThemeContext);
  if (context === undefined) {
    throw new Error('useTubeTheme must be used within a TubeThemeProvider');
  }
  return context;
} 
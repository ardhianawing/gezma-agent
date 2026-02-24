'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface BrandingData {
  primaryColor: string;
  secondaryColor: string | null;
  faviconUrl: string | null;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  appTitle: string;
  logoUrl: string | null;
}

const defaultBranding: BrandingData = {
  primaryColor: '#F60000',
  secondaryColor: null,
  faviconUrl: null,
  logoLightUrl: null,
  logoDarkUrl: null,
  appTitle: 'GEZMA',
  logoUrl: null,
};

interface BrandingContextType {
  branding: BrandingData;
  refreshBranding: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType>({
  branding: defaultBranding,
  refreshBranding: async () => {},
});

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingData>(defaultBranding);

  const fetchBranding = useCallback(async () => {
    try {
      const res = await fetch('/api/agency');
      if (res.ok) {
        const agency = await res.json();
        setBranding({
          primaryColor: agency.primaryColor || '#F60000',
          secondaryColor: agency.secondaryColor || null,
          faviconUrl: agency.faviconUrl || null,
          logoLightUrl: agency.logoLightUrl || null,
          logoDarkUrl: agency.logoDarkUrl || null,
          appTitle: agency.appTitle || 'GEZMA',
          logoUrl: agency.logoUrl || null,
        });
      }
    } catch {
      // Use defaults on error
    }
  }, []);

  useEffect(() => {
    fetchBranding();
  }, [fetchBranding]);

  return (
    <BrandingContext.Provider value={{ branding, refreshBranding: fetchBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}

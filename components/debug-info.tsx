'use client';

import { getDomainConfig } from '@/lib/domain-config';
import { getCurrentDomain } from '@/lib/domain-colors';
import { useState } from 'react';

export function DebugInfo() {
  const [showDebug, setShowDebug] = useState(false);
  
  // Only show in development by default, but allow toggle in production
  const isDev = process.env.NODE_ENV === 'development';
  const shouldShow = isDev || showDebug;
  
  if (!shouldShow) {
    return (
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => setShowDebug(true)}
          className="bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-20 hover:opacity-100"
        >
          Debug
        </button>
      </div>
    );
  }
  
  const config = getDomainConfig();
  const clientDomain = typeof window !== 'undefined' ? getCurrentDomain() : 'N/A';
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'N/A';
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-yellow-400">🔍 Debug Info</h3>
        <button
          onClick={() => setShowDebug(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-1">
        <div>
          <span className="text-gray-400">Server Domain:</span> 
          <span className="text-green-400">{config.site.domain}</span>
        </div>
        
        <div>
          <span className="text-gray-400">Client Domain:</span> 
          <span className="text-blue-400">{clientDomain}</span>
        </div>
        
        <div>
          <span className="text-gray-400">Hostname:</span> 
          <span className="text-purple-400">{hostname}</span>
        </div>
        
        <div>
          <span className="text-gray-400">Site Name:</span> 
          <span className="text-orange-400">{config.site.name}</span>
        </div>
        
        <div>
          <span className="text-gray-400">Env Domain:</span> 
          <span className="text-pink-400">{process.env.NEXT_PUBLIC_DOMAIN || 'Not set'}</span>
        </div>
        
        <div className="pt-2 border-t border-gray-700">
          <div className="text-gray-400">Flags:</div>
          <div className="text-xs">
            BitcoinArg: <span className={config.isBitcoinArg ? 'text-green-400' : 'text-red-400'}>
              {config.isBitcoinArg ? '✓' : '✗'}
            </span>
          </div>
          <div className="text-xs">
            Tendencias: <span className={config.isTendenciasCrypto ? 'text-green-400' : 'text-red-400'}>
              {config.isTendenciasCrypto ? '✓' : '✗'}
            </span>
          </div>
          <div className="text-xs">
            UltimaHora: <span className={config.isUltimaHoraCrypto ? 'text-green-400' : 'text-red-400'}>
              {config.isUltimaHoraCrypto ? '✓' : '✗'}
            </span>
          </div>
        </div>
        
        <div className="pt-2 text-xs text-gray-500">
          {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
} 
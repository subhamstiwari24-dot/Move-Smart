/**
 * MoveSmart Smart Mobility Platform
 * Environment-aware API URL Resolution Utility
 * 
 * In production (e.g. Vercel deployment), VITE_API_BASE_URL specifies the cloud backend URL
 * (e.g., https://movesmart-api.onrender.com or https://api.movesmart.city).
 * Safely handles trailing slashes and '/api' paths.
 */

export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl || typeof envUrl !== 'string' || envUrl.trim() === '') {
    return 'http://localhost:8080/api';
  }
  const trimmed = envUrl.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

export const getBackendOrigin = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl || typeof envUrl !== 'string' || envUrl.trim() === '') {
    return 'http://localhost:8080';
  }
  const trimmed = envUrl.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed.slice(0, -4) : trimmed;
};

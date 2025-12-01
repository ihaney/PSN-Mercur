/**
 * Secure window.open wrapper to prevent tabnabbing attacks
 */
export function safeWindowOpen(url: string, target: string = '_blank', features?: string): Window | null {
  // Add noopener and noreferrer to prevent security issues
  const safeFeatures = features 
    ? `${features},noopener,noreferrer`
    : 'noopener,noreferrer';
  
  const newWindow = window.open(url, target, safeFeatures);
  
  if (newWindow) {
    // Ensure opener is null for security
    newWindow.opener = null;
  }
  
  return newWindow;
}


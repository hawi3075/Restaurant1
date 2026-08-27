import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X, Info } from 'lucide-react';

/**
 * Toast Notification Component
 * 
 * Usage:
 * showToast('Success message', 'success')
 * showToast('Error message', 'error')
 * showToast('Warning message', 'warning')
 */

let toastTimeout;

export function showToast(message, type = 'success', duration = 3000) {
  // Remove existing toast
  const existingToast = document.getElementById('global-toast');
  if (existingToast) {
    existingToast.remove();
  }

  // Clear existing timeout
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.id = 'global-toast';
  toast.className = 'fixed top-24 right-6 z-[9999] animate-slideIn';

  // Set colors/icon based on type — badgeBg is the little icon-circle color,
  // accentBar is the thin gradient strip along the top of the card.
  let badgeBg, badgeText, accentFrom, accentTo, icon;
  switch (type) {
    case 'success':
      badgeBg = 'bg-green-100';
      badgeText = 'text-green-600';
      accentFrom = 'from-green-500';
      accentTo = 'to-emerald-500';
      icon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
      </svg>`;
      break;
    case 'error':
      badgeBg = 'bg-red-100';
      badgeText = 'text-red-600';
      accentFrom = 'from-red-500';
      accentTo = 'to-rose-500';
      icon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
      </svg>`;
      break;
    case 'warning':
      badgeBg = 'bg-amber-100';
      badgeText = 'text-amber-600';
      accentFrom = 'from-amber-500';
      accentTo = 'to-orange-500';
      icon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
      </svg>`;
      break;
    default:
      badgeBg = 'bg-orange-100';
      badgeText = 'text-orange-600';
      accentFrom = 'from-orange-500';
      accentTo = 'to-amber-500';
      icon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>`;
  }

  toast.innerHTML = `
    <div class="relative flex items-start gap-3 bg-white border border-gray-100 rounded-2xl pl-4 pr-3 py-3.5 shadow-2xl min-w-[320px] max-w-md overflow-hidden">
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accentFrom} ${accentTo}"></div>
      <div class="flex-shrink-0 ${badgeBg} ${badgeText} w-9 h-9 rounded-xl flex items-center justify-center mt-0.5">
        ${icon}
      </div>
      <p class="flex-1 text-sm font-bold text-gray-800 pt-1.5 leading-snug">${message}</p>
      <button onclick="this.closest('#global-toast').remove()" class="flex-shrink-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition mt-0.5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `;

  // Add animation styles (only injected once)
  if (!document.getElementById('toast-animation-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-animation-styles';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
      .animate-slideIn {
        animation: slideIn 0.3s ease-out;
      }
      .animate-slideOut {
        animation: slideOut 0.3s ease-in;
      }
    `;
    document.head.appendChild(style);
  }

  // Add to document
  document.body.appendChild(toast);

  // Auto remove after duration
  toastTimeout = setTimeout(() => {
    if (toast) {
      toast.classList.remove('animate-slideIn');
      toast.classList.add('animate-slideOut');
      setTimeout(() => {
        if (toast && toast.parentElement) {
          toast.remove();
        }
      }, 300);
    }
  }, duration);
}

// React component version (optional)
export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  let Icon, badgeBg, badgeText, accentFrom, accentTo;
  switch (type) {
    case 'success':
      Icon = CheckCircle;
      badgeBg = 'bg-green-100';
      badgeText = 'text-green-600';
      accentFrom = 'from-green-500';
      accentTo = 'to-emerald-500';
      break;
    case 'error':
      Icon = XCircle;
      badgeBg = 'bg-red-100';
      badgeText = 'text-red-600';
      accentFrom = 'from-red-500';
      accentTo = 'to-rose-500';
      break;
    case 'warning':
      Icon = AlertCircle;
      badgeBg = 'bg-amber-100';
      badgeText = 'text-amber-600';
      accentFrom = 'from-amber-500';
      accentTo = 'to-orange-500';
      break;
    default:
      Icon = Info;
      badgeBg = 'bg-orange-100';
      badgeText = 'text-orange-600';
      accentFrom = 'from-orange-500';
      accentTo = 'to-amber-500';
  }

  return (
    <div className="fixed top-24 right-6 z-50 animate-slideIn">
      <div className="relative flex items-start gap-3 bg-white border border-gray-100 rounded-2xl pl-4 pr-3 py-3.5 shadow-2xl min-w-[320px] max-w-md overflow-hidden">
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accentFrom} ${accentTo}`} />
        <div className={`flex-shrink-0 ${badgeBg} ${badgeText} w-9 h-9 rounded-xl flex items-center justify-center mt-0.5`}>
          <Icon className="w-5 h-5" />
        </div>
        <p className="flex-1 text-sm font-bold text-gray-800 pt-1.5 leading-snug">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition mt-0.5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
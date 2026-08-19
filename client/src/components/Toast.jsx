import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

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
  toast.className = 'fixed top-20 right-6 z-[9999] animate-slideIn';
  
  // Set colors based on type
  let bgColor, borderColor, textColor, icon;
  switch (type) {
    case 'success':
      bgColor = 'bg-green-50';
      borderColor = 'border-green-200';
      textColor = 'text-green-700';
      icon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>`;
      break;
    case 'error':
      bgColor = 'bg-red-50';
      borderColor = 'border-red-200';
      textColor = 'text-red-700';
      icon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>`;
      break;
    case 'warning':
      bgColor = 'bg-yellow-50';
      borderColor = 'border-yellow-200';
      textColor = 'text-yellow-700';
      icon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
      </svg>`;
      break;
    default:
      bgColor = 'bg-blue-50';
      borderColor = 'border-blue-200';
      textColor = 'text-blue-700';
      icon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>`;
  }

  toast.innerHTML = `
    <div class="flex items-center space-x-3 ${bgColor} ${borderColor} ${textColor} border-2 rounded-2xl px-5 py-4 shadow-2xl min-w-[320px] max-w-md backdrop-blur-sm">
      <div class="flex-shrink-0">
        ${icon}
      </div>
      <p class="flex-1 text-sm font-bold">${message}</p>
      <button onclick="this.parentElement.parentElement.remove()" class="flex-shrink-0 hover:opacity-70 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `;

  // Add animation styles
  const style = document.createElement('style');
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

  let Icon, bgColor, borderColor, textColor;
  switch (type) {
    case 'success':
      Icon = CheckCircle;
      bgColor = 'bg-green-50';
      borderColor = 'border-green-200';
      textColor = 'text-green-700';
      break;
    case 'error':
      Icon = XCircle;
      bgColor = 'bg-red-50';
      borderColor = 'border-red-200';
      textColor = 'text-red-700';
      break;
    case 'warning':
      Icon = AlertCircle;
      bgColor = 'bg-yellow-50';
      borderColor = 'border-yellow-200';
      textColor = 'text-yellow-700';
      break;
    default:
      Icon = AlertCircle;
      bgColor = 'bg-blue-50';
      borderColor = 'border-blue-200';
      textColor = 'text-blue-700';
  }

  return (
    <div className="fixed top-20 right-6 z-50 animate-slideIn">
      <div className={`flex items-center space-x-3 ${bgColor} ${borderColor} ${textColor} border-2 rounded-2xl px-5 py-4 shadow-2xl min-w-[320px] max-w-md backdrop-blur-sm`}>
        <Icon className="w-5 h-5 flex-shrink-0" />
        <p className="flex-1 text-sm font-bold">{message}</p>
        <button onClick={onClose} className="flex-shrink-0 hover:opacity-70 transition">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

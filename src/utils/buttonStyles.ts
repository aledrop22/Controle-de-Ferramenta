import { ButtonStyleVariant } from '../types';

export function getPrimaryButtonStyle(variant?: ButtonStyleVariant): string {
  // Industrial Slate & Rose Accent Standard Style
  return 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-900/30 ring-1 ring-rose-400/30 active:scale-[0.98] transition-all duration-200';
}

export function getActionButtonStyle(variant?: ButtonStyleVariant, isDanger = true): string {
  if (isDanger) {
    // Return action button style
    return 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm ring-1 ring-rose-500/50 transition-all duration-150 active:scale-95';
  } else {
    // Secondary / Neutral action buttons
    return 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all duration-150 active:scale-95';
  }
}


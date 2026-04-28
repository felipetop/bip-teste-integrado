import { Component, computed, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  templateUrl: './button.component.html',
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);

  protected readonly classes = computed(() => {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-sky-500 hover:bg-sky-400 text-white focus:ring-sky-500',
      secondary:
        'bg-slate-700 hover:bg-slate-600 text-slate-100 focus:ring-slate-500',
      danger: 'bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500',
      ghost:
        'bg-transparent hover:bg-slate-700 text-slate-200 focus:ring-slate-500',
    };

    const sizes: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return `${base} ${variants[this.variant()]} ${sizes[this.size()]}`;
  });
}

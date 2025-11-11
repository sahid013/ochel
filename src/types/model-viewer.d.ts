declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        src?: string;
        'ios-src'?: string;
        ar?: boolean;
        'ar-modes'?: string;
        'camera-controls'?: boolean;
        'touch-action'?: string;
        exposure?: string;
        'shadow-intensity'?: string;
        alt?: string;
        'interaction-prompt'?: string;
        'interaction-prompt-threshold'?: string;
        'interaction-prompt-style'?: string;
        'auto-rotate'?: boolean;
        'auto-rotate-delay'?: string;
        'auto-rotate-speed'?: string;
        tabindex?: string;
      },
      HTMLElement
    >;
  }
}

declare module '@radix-ui/react-tabs' {
  import * as React from 'react';

  // Root component
  const Root: React.FC<React.HTMLAttributes<HTMLDivElement> & {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    orientation?: 'horizontal' | 'vertical';
    dir?: 'ltr' | 'rtl';
    activationMode?: 'automatic' | 'manual';
  }>;

  // List component
  const List: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
  >;

  // Trigger component
  const Trigger: React.ForwardRefExoticComponent<
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
      value: string;
      disabled?: boolean;
    } & React.RefAttributes<HTMLButtonElement>
  >;

  // Content component
  const Content: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & {
      value: string;
      forceMount?: boolean;
    } & React.RefAttributes<HTMLDivElement>
  >;

  export {
    Root,
    List,
    Trigger,
    Content
  };
}
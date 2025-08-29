import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { NotificationProvider } from './app/contexts/NotificationContext';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
}

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <NotificationProvider>
      {children}
    </NotificationProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  const Wrapper = options?.wrapper || AllTheProviders;
  return render(ui, { wrapper: Wrapper, ...options });
};

export * from '@testing-library/react';
export { customRender as render };

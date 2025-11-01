import { useEffect } from 'react';

export function useScrollToTop(deps: any[] = []) {
  useEffect(() => {
    const scrollToTop = () => {
      const scrollableContainer = document.querySelector('.overflow-y-auto');
      if (scrollableContainer) {
        (scrollableContainer as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    scrollToTop();
    const timeoutId = setTimeout(scrollToTop, 50);
    return () => clearTimeout(timeoutId as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}



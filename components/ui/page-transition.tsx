"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Spinner from './loading-spinner';
import styles from './spinner.module.css';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [content, setContent] = useState(children);

  // Track route changes
  useEffect(() => {
    // If the pathname has changed, show loading
    if (pathname !== prevPathname) {
      setIsLoading(true);
      
      // Update the previous pathname
      setPrevPathname(pathname);
      
      // Set a timeout to hide the loading spinner after a short delay
      const timer = setTimeout(() => {
        setIsLoading(false);
        setContent(children);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [pathname, prevPathname, children]);

  // Initial render
  useEffect(() => {
    setContent(children);
  }, []);

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
          <Spinner size="medium" onComplete={() => setIsLoading(false)} />
        </div>
      )}
      <div className={isLoading ? styles['page-transition-exit'] : styles['page-transition-enter']}>
        {content}
      </div>
    </>
  );
};

export default PageTransition;
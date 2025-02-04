"use client";

import React from 'react';
import styles from './spinner.module.css';

interface SpinnerProps {
  onComplete?: () => void;
}

const Spinner: React.FC<SpinnerProps> = ({
  onComplete
}) => {
  React.useEffect(() => {
    // Simulate completion after 4 seconds
    const timer = setTimeout(() => {
      onComplete?.();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={styles['spinner-box']}>
      <div className={styles['circle-border']}>
        <div className={styles['circle-core']}></div>
      </div>
    </div>
  );
};

export default Spinner;
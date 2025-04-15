"use client";

import React from 'react';
import Image from 'next/image';
import styles from './spinner.module.css';

interface SpinnerProps {
  onComplete?: () => void;
  size?: 'small' | 'medium' | 'large';
}

const Spinner: React.FC<SpinnerProps> = ({
  onComplete,
  size = 'medium'
}) => {
  React.useEffect(() => {
    // Simulate completion after 4 seconds
    const timer = setTimeout(() => {
      onComplete?.();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Size classes
  const containerSizeClass = {
    small: 'w-32 h-32',
    medium: 'w-48 h-48',
    large: 'w-64 h-64'
  }[size];

  const logoSizeClass = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  }[size];

  return (
    <div className={`${styles['spinner-box']} ${containerSizeClass}`}>
      <div className={styles['logo-container']}>
        <Image 
          src="/ltlogo.png" 
          alt="Lifted Trucks Logo" 
          width={100} 
          height={100}
          className={`${styles['logo']} ${logoSizeClass}`}
        />
      </div>
      <div className={styles['tire-border']}>
        <div className={styles['tire-core']}>
          <Image 
            src="/treadicon.svg" 
            alt="Tire Icon" 
            width={80} 
            height={80}
            className={styles['tire-icon']}
          />
        </div>
      </div>
    </div>
  );
};

export default Spinner;
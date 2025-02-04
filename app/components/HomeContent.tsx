"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function HomeContent(): React.ReactNode {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // If user is authenticated, redirect to daily-log
        router.push('/daily-log');
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="landing-page">
      <video className="background-video" autoPlay loop muted>
        <source
          src="https://videos.dealer.com/videos2/clients/l/liftedtrucks/0c7bf40882214349aff636bed5cd0518_highest.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

      <div className="content-overlay">
        <h1>Welcome to the Lifted Trucks Employee Portal</h1>
        <h2>Work Hard. Play Hard. Drive Harder.</h2>

        <div className="button-container">
          <Link href="/auth">
            <Button className="bg-transparent text-white border-2 border-white p-2 rounded-none transition-all duration-300 ease-in-out hover:bg-orange-500 hover:border-orange-500 active:transform active:scale-95">
              <span className="px-4">Let's Go!</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomeContent() {

  return (
    <div className="landing-page">
      <video className="background-video" autoPlay loop muted playsInline>
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
              <span className="px-4">Let&apos;s Go!</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
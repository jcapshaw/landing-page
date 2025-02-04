import type { Metadata } from "next";
import HomeContent from "./components/HomeContent";

export const metadata: Metadata = {
  title: 'Lifted Trucks Employee Portal',
  description: 'Welcome to the Lifted Trucks Employee Portal',
};

export default function Home(): React.ReactNode {
  return <HomeContent />;
}
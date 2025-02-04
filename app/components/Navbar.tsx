import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-gradient-to-r from-gray-900 to-black border-b">
      <div>
        <Image src="/30ltlogo.png" alt="Logo" width={60} height={60} />
      </div>
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="text-sm font-medium text-white hover:text-orange-500">
          Dashboard
        </Link>
        <Link href="/inventory" className="text-sm font-medium text-white hover:text-orange-500">
          Inventory
        </Link>
        <Link href="/resources" className="text-sm font-medium text-white hover:text-orange-500">
          Resources
        </Link>
        <Link href="/daily-log" className="text-sm font-medium text-white hover:text-orange-500">
          Daily Log
        </Link>
        <Link
          href="/auth"
          className="bg-orange-500 text-white hover:bg-orange-600 px-4 py-2 rounded-md text-sm font-medium"
        >
          Sign In
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
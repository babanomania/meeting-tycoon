import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  bottomNav?: ReactNode;
}

/**
 * Phone-frame chrome. On laptop/desktop (lg+, 1024px+) we render an
 * iPhone-ish frame so the experience still feels like the wireframes.
 * Below that — phones AND tablets in any orientation — fills the viewport
 * edge-to-edge so the OS chrome (status bar, home bar) is the only frame.
 *
 * Breakpoint note: previously this used `md:` (768px) which painted the
 * bezel on iPad portraits and landscape phones. `lg:` (1024px) means only
 * actual laptops get the bezel.
 *
 * No fake mobile status bar inside the app — the real OS provides that.
 * Putting a "9:41 / battery / signal" pretend bar in-app reads as cosplay.
 */
export function PhoneFrame({ children, bottomNav }: Props) {
  return (
    <div className="min-h-screen w-full flex items-stretch lg:items-center justify-center lg:py-10">
      <div
        className="
          relative w-full lg:w-[400px] lg:h-[860px] h-[100dvh]
          bg-white overflow-hidden
          lg:rounded-[44px] lg:shadow-[0_30px_80px_rgba(0,0,0,0.45),0_0_0_10px_#0F172A,0_0_0_12px_#1f2937]
          flex flex-col
        "
      >
        <div className="flex-1 overflow-y-auto phone-scroll pt-[env(safe-area-inset-top)]">
          {children}
        </div>
        {bottomNav}
      </div>
    </div>
  );
}

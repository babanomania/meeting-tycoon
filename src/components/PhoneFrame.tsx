import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  bottomNav?: ReactNode;
}

/**
 * Phone-frame chrome. On desktop we render an iPhone-ish frame so the experience
 * still feels like the wireframes. On phone widths it fills the viewport.
 *
 * Note: no fake mobile status bar — the real OS provides that. Putting another
 * "9:41 / battery / signal" inside the app reads as cosplay, not Teams.
 */
export function PhoneFrame({ children, bottomNav }: Props) {
  return (
    <div className="min-h-screen w-full flex items-stretch md:items-center justify-center md:py-10">
      <div
        className="
          relative w-full md:w-[400px] md:h-[860px] h-[100dvh]
          bg-white overflow-hidden
          md:rounded-[44px] md:shadow-[0_30px_80px_rgba(0,0,0,0.45),0_0_0_10px_#0F172A,0_0_0_12px_#1f2937]
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

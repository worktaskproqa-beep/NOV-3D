import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 20): SVGProps<SVGSVGElement> => ({
  width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 1.25, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, focusable: false,
});

export const SearchIcon = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>);
export const UserIcon = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5c1.4-3.6 4.2-5.5 7.5-5.5s6.1 1.9 7.5 5.5" /></svg>);
export const BagIcon = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M5 8h14l-1 12.5H6L5 8Z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></svg>);
export const MenuIcon = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M3.5 8h17M3.5 16h17" /></svg>);
export const CloseIcon = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="m6 6 12 12M18 6 6 18" /></svg>);
/** Directional — add className="flip-rtl" so it mirrors in Arabic */
export const ArrowIcon = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M4 12h16M14 6l6 6-6 6" /></svg>);
export const ChevronIcon = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="m9 6 6 6-6 6" /></svg>);
export const PlusIcon = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M12 5v14M5 12h14" /></svg>);
export const MinusIcon = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M5 12h14" /></svg>);
export const InstagramIcon = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r=".6" fill="currentColor" /></svg>);
export const TikTokIcon = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M14 3.5v11.2a3.8 3.8 0 1 1-3.8-3.8" /><path d="M14 3.5c.5 2.6 2.3 4.3 5 4.6" /></svg>);
export const PinterestIcon = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="12" cy="12" r="8.5" /><path d="M11 9.5c0-1.4 1-2.5 2.4-2.5 1.6 0 2.6 1.2 2.6 2.8 0 2.2-1.3 3.9-3 3.9-.9 0-1.5-.6-1.4-1.4M11.6 11l-2 8" /></svg>);
export const CheckIcon = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>);

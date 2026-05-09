import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

const wrap = (path: React.ReactNode, vb = "0 0 24 24") =>
  function Icon({ size = 16, ...rest }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox={vb}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...rest}
      >
        {path}
      </svg>
    );
  };

export const SearchIcon = wrap(
  <>
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
    <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </>
);

export const ChevronDownIcon = wrap(
  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
);

export const ChevronRightIcon = wrap(
  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
);

export const ChevronLeftIcon = wrap(
  <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
);

export const FilterIcon = wrap(
  <>
    <path d="M5 7h14M7 12h10M9 17h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </>
);

export const EyeIcon = wrap(
  <>
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/>
  </>
);

export const StarIcon = ({ size = 14, color = "#facc15", ...rest }: React.SVGProps<SVGSVGElement> & { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...rest}>
    <path
      d="M12 2.6l2.85 6.06 6.65.6-5.05 4.55 1.5 6.55L12 16.85l-5.95 3.5 1.5-6.55L2.5 9.26l6.65-.6L12 2.6z"
      fill={color}
    />
  </svg>
);

export const ExternalLinkIcon = wrap(
  <>
    <path d="M14 4h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 4l-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M19 13v5a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </>
);

// Stylized 3-color drive logo (simplified)
export const DriveIcon = ({ size = 18, ...rest }: React.SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...rest}>
    <path d="M8.5 4h7L21 14h-7L8.5 4z" fill="#FBBC04" />
    <path d="M2.5 14L8.5 4l5.5 10H2.5z" fill="#4285F4" />
    <path d="M5.5 20l-3-6h11.5l-3 6H5.5z" fill="#34A853" />
    <path d="M14 14l3 6h-5.5l3-6H14z" fill="#34A853" opacity="0.7" />
  </svg>
);

export const ChevronDownSmallIcon = wrap(
  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
);

export const LinkIcon = wrap(
  <>
    <path d="M9.5 13.5a4 4 0 005.66 0l3-3a4 4 0 10-5.66-5.66l-1 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14.5 10.5a4 4 0 00-5.66 0l-3 3a4 4 0 105.66 5.66l1-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </>
);

export const ShareIcon = wrap(
  <>
    <circle cx="6" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="18" cy="6" r="2.4" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="18" cy="18" r="2.4" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8.2 11l7.6-4M8.2 13l7.6 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </>
);

export const ExpandIcon = wrap(
  <path
    d="M5 9V5h4M19 9V5h-4M5 15v4h4M19 15v4h-4"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
);

export const CloseIcon = wrap(
  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
);

export const HomeIcon = wrap(
  <path
    d="M4 11l8-7 8 7v8a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1v-8z"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinejoin="round"
  />
);

export const PeopleIcon = wrap(
  <>
    <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
    <path d="M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="17" cy="9" r="2.3" stroke="currentColor" strokeWidth="1.4" />
    <path d="M16 14c2.5 0 5 1.5 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </>
);

export const FlameIcon = wrap(
  <path
    d="M12 2s4 4 4 8a4 4 0 11-8 0c0-1 .5-2 1-2.5C8 9 7 11 7 13a5 5 0 0010 0c0-3-2-5-3-7-1-1.6-2-4-2-4z"
    fill="currentColor"
  />
);

export const PlusIcon = wrap(
  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
);

export const HeartIcon = wrap(
  <path
    d="M12 20s-7-4.35-7-10a4 4 0 017-2.65A4 4 0 0119 10c0 5.65-7 10-7 10z"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinejoin="round"
  />
);

export const VerifiedIcon = ({ size = 14, ...rest }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...rest}>
    <path
      d="M12 1.5l2.4 1.7 2.9-.4 1.4 2.6 2.6 1.4-.4 2.9 1.7 2.4-1.7 2.4.4 2.9-2.6 1.4-1.4 2.6-2.9-.4L12 22.5l-2.4-1.7-2.9.4-1.4-2.6-2.6-1.4.4-2.9L1.4 12l1.7-2.4-.4-2.9 2.6-1.4 1.4-2.6 2.9.4L12 1.5z"
      fill="#3a8bff"
    />
    <path d="M8 12.2l2.6 2.6L16 9.4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export const MusicIcon = wrap(
  <>
    <path d="M9 18V6l11-2v12" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="17" cy="16" r="3" stroke="currentColor" strokeWidth="1.6" />
  </>
);

// Platform icon glyphs (simplified, brand-neutral marks)
export const TiktokIcon = wrap(
  <path
    d="M16 3c.4 2.4 2.1 4.1 4.5 4.5v3.1c-1.7 0-3.4-.5-4.5-1.5v6.4a5.5 5.5 0 11-5.5-5.5c.3 0 .7 0 1 .1v3.2a2.4 2.4 0 102 2.4V3h2.5z"
    fill="currentColor"
  />
);

export const YouTubeIcon = wrap(
  <>
    <rect x="2.5" y="6" width="19" height="12" rx="3" fill="currentColor" />
    <path d="M10.5 9.5v5l4.5-2.5-4.5-2.5z" fill="#151515" />
  </>
);

export const InstagramIcon = wrap(
  <>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="17" cy="7" r="1.1" fill="currentColor" />
  </>
);

export const XIcon = wrap(
  <path
    d="M3 3h4.5L12 9l4.5-6H21l-7 9 7.5 9H17l-5-6.5L7 21H2.5l7.7-9.7L3 3z"
    fill="currentColor"
  />
);

export const TwitchIcon = wrap(
  <>
    <path
      d="M4 3h16v11l-4 4h-3l-3 3H8v-3H4V3z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M11 8v5M15 8v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </>
);

export const platformGlyph = (key: string, size = 14) => {
  const props = { size, className: "text-white/85" };
  switch (key) {
    case "tiktok": return <TiktokIcon {...props} />;
    case "youtube": return <YouTubeIcon {...props} />;
    case "instagram": return <InstagramIcon {...props} />;
    case "x": return <XIcon {...props} />;
    case "twitch": return <TwitchIcon {...props} />;
    default: return null;
  }
};

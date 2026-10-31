import { forwardRef } from 'react';

const CricketPitch = forwardRef(function CricketPitch({ phase, onSwing, onAim }, ballRef) {
  return (
    <svg
      className={`cricket-pitch pitch-${phase}`}
      viewBox="0 0 900 480"
      role="img"
      aria-label="Floodlit cricket ground. The email ball bowls toward your bat at the bottom. Hit it toward your chosen scoring zone."
      onPointerDown={onSwing}
      onPointerMove={onAim}
    >
      <defs>
        <radialGradient id="grass">
          <stop stopColor="#236b52" />
          <stop offset="1" stopColor="#0c342f" />
        </radialGradient>
        <linearGradient id="wicket" x2="0" y2="1">
          <stop stopColor="#c3af78" />
          <stop offset="1" stopColor="#79684a" />
        </linearGradient>
        <radialGradient id="flood">
          <stop stopColor="#b9f8ed" stopOpacity=".2" />
          <stop offset="1" stopColor="#b9f8ed" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="900" height="480" fill="#081821" />
      <path d="M0 45Q450-30 900 45V150H0Z" fill="#172a39" />
      {Array.from({ length: 50 }, (_, i) => (
        <circle
          key={i}
          cx={i * 19}
          cy={55 + (i % 3) * 16}
          r="3"
          fill={['#59b9b4', '#899c80', '#4b5e79'][i % 3]}
        />
      ))}
      <ellipse cx="450" cy="320" rx="450" ry="245" fill="url(#grass)" />
      <ellipse
        cx="450"
        cy="305"
        rx="405"
        ry="207"
        stroke="#8dc6a1"
        strokeWidth="2"
        fill="none"
        strokeDasharray="5 7"
      />
      <ellipse
        cx="450"
        cy="305"
        rx="285"
        ry="150"
        stroke="#ffffff12"
        strokeWidth="35"
        fill="none"
      />
      <path d="M410 160H490L530 440H370Z" fill="url(#wicket)" />
      <path d="M401 207H499M381 390H519" stroke="#fff4ca" strokeWidth="4" />
      <path
        d="M425 156v-26m25 26v-26m25 26v-26m-55 0h60M425 422v-30m25 30v-30m25 30v-30m-55 0h60"
        stroke="#f8e6a3"
        strokeWidth="5"
      />
      <ellipse
        className="strike-zone"
        cx="450"
        cy="365"
        rx="60"
        ry="29"
        fill="#c9fa6818"
        stroke="#c9fa68"
        strokeDasharray="7 6"
      />
      <text x="450" y="452" textAnchor="middle" fill="#b9d7cb" fontSize="13" fontWeight="800">
        YOUR CREASE · CLICK / SPACE TO SWING
      </text>
      <g fill="#d2f8f4">
        <path d="M40 145V30m820 115V30" stroke="#586b80" strokeWidth="6" />
        <rect x="17" y="22" width="50" height="17" rx="3" />
        <rect x="833" y="22" width="50" height="17" rx="3" />
      </g>
      <circle cx="40" cy="40" r="170" fill="url(#flood)" />
      <circle cx="860" cy="40" r="170" fill="url(#flood)" />
      <g className="cricket-bat" transform="translate(500 402)">
        <path d="M0 0L-11-27" stroke="#e0dcd0" strokeWidth="10" strokeLinecap="round" />
        <path
          d="M-11-22L-54-104Q-57-112-65-107L-78-99Q-84-95-79-87L-29-14Z"
          fill="#ebbf77"
          stroke="#382d26"
          strokeWidth="3"
        />
        <path d="M-36-53L-64-95" stroke="#e56050" strokeWidth="10" />
        <path d="M-24-24L-45-60" stroke="#8b6634" strokeWidth="2" />
      </g>
      <g ref={ballRef} className="email-ball" transform="translate(450 145)">
        <ellipse cy="14" rx="14" ry="4" fill="#0005" />
        <circle r="13" fill="#f46c62" stroke="#ffb5a8" strokeWidth="2" />
        <path
          d="M-4-11Q4 0-4 11"
          fill="none"
          stroke="#fff4df"
          strokeWidth="2"
          strokeDasharray="3 2"
        />
        <rect x="6" y="-18" width="19" height="13" rx="2" fill="#f5f8ef" />
        <path d="M7-16l8 6 8-6" fill="none" stroke="#255751" strokeWidth="2" />
      </g>
    </svg>
  );
});
export default CricketPitch;

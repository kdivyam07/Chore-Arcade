export default function GameArtwork({ id }) {
  return (
    <svg viewBox="0 0 360 180" className="game-artwork" aria-hidden="true">
      <rect
        width="360"
        height="180"
        rx="12"
        fill={id === 'cricket' ? '#0e302c' : id === 'blaster' ? '#101b35' : '#322428'}
      />
      {id === 'cricket' ? (
        <>
          <ellipse cx="180" cy="130" rx="170" ry="85" fill="#1b5642" />
          <ellipse
            cx="180"
            cy="120"
            rx="150"
            ry="65"
            stroke="#88b79266"
            fill="none"
            strokeDasharray="4 5"
          />
          <path d="M164 58h32l20 110h-72z" fill="#af955f" />
          <path d="M168 147v22m12-22v22m12-22v22" stroke="#f6e0a1" strokeWidth="4" />
          <g className="art-ball">
            <circle cx="230" cy="67" r="15" fill="#f5826c" />
            <path d="M226 54q10 12 0 26" stroke="white" fill="none" strokeDasharray="3 3" />
          </g>
          <path d="M202 137l-33-53-12 7 34 53" fill="#edbd75" stroke="#584226" strokeWidth="3" />
          <path d="M244 50l32-18m-23 34 39-8" stroke="#c9fa6877" strokeWidth="3" />
        </>
      ) : id === 'blaster' ? (
        <>
          {Array.from({ length: 24 }, (_, i) => (
            <circle key={i} cx={(i * 47) % 360} cy={(i * 31) % 180} r="1.5" fill="#b6e4fb" />
          ))}
          <circle cx="282" cy="50" r="25" fill="#655d98" />
          <ellipse
            cx="282"
            cy="50"
            rx="43"
            ry="9"
            stroke="#a0b7e955"
            fill="none"
            transform="rotate(-25 282 50)"
          />
          <g className="art-ball">
            <path d="M120 30l23-10 24 13 8 29-25 19-27-9-12-22z" fill="#9a718f" />
            <rect x="129" y="37" width="30" height="20" rx="3" fill="#ecf5ff" />
            <path d="M131 40l13 10 13-10" stroke="#315d75" fill="none" />
          </g>
          <path d="M180 108l-28 51 28-9 28 9z" fill="#c7e5f2" />
          <path d="M172 154l8 21 8-21" fill="#70dcff" />
          <path d="M180 93V71" stroke="#c9fa68" strokeWidth="6" />
        </>
      ) : (
        <>
          <path
            d="M0 140h360M60 140l-30 40m110-40-10 40m90-40 10 40m70-40 30 40"
            stroke="#ffc17722"
          />
          <path d="M260 35v126" stroke="#8897a5" strokeWidth="5" />
          <rect
            x="221"
            y="20"
            width="78"
            height="50"
            fill="#e3edee22"
            stroke="#c4d6df"
            strokeWidth="3"
          />
          <rect x="244" y="37" width="30" height="27" fill="none" stroke="#fff" strokeWidth="2" />
          <path
            d="M235 70l10 34h31l10-34m-42 18h33m-19-18v34"
            fill="none"
            stroke="#e9d6b8"
            strokeWidth="2"
          />
          <ellipse cx="260" cy="70" rx="28" ry="5" fill="none" stroke="#ff9f65" strokeWidth="5" />
          <path
            d="M82 145q35-155 164-86"
            stroke="#ffc17766"
            strokeWidth="2"
            strokeDasharray="5 6"
            fill="none"
          />
          <g className="art-ball">
            <circle cx="128" cy="77" r="21" fill="#e89d51" stroke="#f5cf93" strokeWidth="2" />
            <path
              d="M107 77h42m-21-21v42m-15-36q25 16 0 30"
              fill="none"
              stroke="#774c2d"
              strokeWidth="2"
            />
          </g>
        </>
      )}
    </svg>
  );
}

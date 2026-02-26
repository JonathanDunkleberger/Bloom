"use client";

/**
 * SVG elements for shop items rendered on the planet surface.
 * Each item is a <g> group meant to be placed at a surface position.
 */

interface PlanetItemProps {
  id: string;
  x: number;
  y: number;
  rotation: number; // degrees, to align with planet curvature
  scale?: number;
}

export function PlanetItem({ id, x, y, rotation, scale = 1 }: PlanetItemProps) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation}) scale(${scale})`}>
      {renderItem(id)}
    </g>
  );
}

function renderItem(id: string) {
  switch (id) {
    // ── Landscape ──
    case "pond":
      return (
        <g>
          <ellipse cx="0" cy="0" rx="10" ry="5" fill="#5BA4D9" opacity="0.7" />
          <ellipse cx="0" cy="-1" rx="7" ry="3" fill="#7BBFEF" opacity="0.5" />
          <ellipse cx="-2" cy="-1.5" rx="3" ry="1.2" fill="white" opacity="0.25" />
          {/* Ripple rings */}
          <ellipse cx="2" cy="0" rx="3" ry="1.5" fill="none" stroke="white" strokeWidth="0.3" opacity="0.2">
            <animate attributeName="rx" values="1;5;1" dur="4s" repeatCount="indefinite" />
            <animate attributeName="ry" values="0.5;2.5;0.5" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0;0.3" dur="4s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="-2" cy="1" rx="2" ry="1" fill="none" stroke="white" strokeWidth="0.3" opacity="0.15">
            <animate attributeName="rx" values="0.5;4;0.5" dur="5s" repeatCount="indefinite" />
            <animate attributeName="ry" values="0.25;2;0.25" dur="5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.25;0;0.25" dur="5s" repeatCount="indefinite" />
          </ellipse>
          {/* Koi fish */}
          <ellipse cx="0" cy="0" rx="1.2" ry="0.6" fill="#FF8A65" opacity="0.7">
            <animateMotion path="M-3,0 Q0,-2 3,0 Q0,2 -3,0" dur="6s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="0" cy="0" rx="0.9" ry="0.5" fill="#FFB74D" opacity="0.6">
            <animateMotion path="M2,1 Q-1,0 -3,1 Q0,2 2,1" dur="7s" repeatCount="indefinite" />
          </ellipse>
        </g>
      );
    case "bridge":
      return (
        <g>
          <rect x="-8" y="-2" width="16" height="3" rx="1" fill="#8B6D42" />
          <rect x="-8" y="-2" width="16" height="1.5" rx="1" fill="#A0804E" />
          <rect x="-7" y="-5" width="1.5" height="4" rx="0.5" fill="#7B5D38" />
          <rect x="5.5" y="-5" width="1.5" height="4" rx="0.5" fill="#7B5D38" />
          <rect x="-8" y="-5.5" width="16" height="1" rx="0.5" fill="#6B5030" />
        </g>
      );
    case "bench":
      return (
        <g>
          <rect x="-6" y="-1" width="12" height="2" rx="0.8" fill="#A0804E" />
          <rect x="-6" y="-4" width="12" height="1.5" rx="0.8" fill="#8B6D42" />
          <rect x="-5" y="-1" width="1" height="3" fill="#6B5030" />
          <rect x="4" y="-1" width="1" height="3" fill="#6B5030" />
        </g>
      );
    case "fence":
      return (
        <g>
          {[-6, -2, 2, 6].map((fx, i) => (
            <rect key={i} x={fx - 0.6} y="-7" width="1.2" height="7" rx="0.4" fill="#D4C4A0" />
          ))}
          <rect x="-7" y="-5.5" width="14" height="1" rx="0.3" fill="#C8B890" />
          <rect x="-7" y="-2.5" width="14" height="1" rx="0.3" fill="#C8B890" />
        </g>
      );
    case "stone-path":
      return (
        <g>
          <ellipse cx="-4" cy="0" rx="2.5" ry="1.8" fill="#A0A090" opacity="0.7" />
          <ellipse cx="0" cy="-2" rx="3" ry="2" fill="#909080" opacity="0.65" />
          <ellipse cx="4" cy="0.5" rx="2.2" ry="1.5" fill="#B0B0A0" opacity="0.6" />
          <ellipse cx="1" cy="2" rx="2" ry="1.4" fill="#989888" opacity="0.55" />
        </g>
      );

    // ── Trees ──
    case "sakura":
      return (
        <g>
          <rect x="-1.2" y="-8" width="2.4" height="8" rx="1" fill="#6B5344" />
          <rect x="-0.6" y="-7" width="1.2" height="7" rx="0.5" fill="#7B6354" opacity="0.6" />
          <ellipse cx="0" cy="-12" rx="8" ry="6" fill="#FFB6C1" opacity="0.8" />
          <ellipse cx="-3" cy="-13" rx="5" ry="4" fill="#FF85A2" opacity="0.6" />
          <ellipse cx="3" cy="-11" rx="4.5" ry="3.5" fill="#FFC0CB" opacity="0.5" />
          {/* Blossoms */}
          <circle cx="-5" cy="-14" r="1" fill="#FF69B4" opacity="0.7" />
          <circle cx="4" cy="-13" r="0.8" fill="#FF69B4" opacity="0.6" />
          <circle cx="0" cy="-15" r="0.7" fill="#FFB6C1" opacity="0.8" />
          {/* Falling petals */}
          {[0, 1, 2, 3].map(i => {
            const startX = -6 + i * 4;
            const dur = 4 + i * 1.2;
            return (
              <ellipse key={`petal${i}`} cx={startX} cy={-14} rx="0.8" ry="0.5" fill="#FFB6C1" opacity="0.6">
                <animate attributeName="cy" values={`${-14};2`} dur={`${dur}s`} repeatCount="indefinite" />
                <animate attributeName="cx" values={`${startX};${startX + 3 - i}`} dur={`${dur}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0.3;0" dur={`${dur}s`} repeatCount="indefinite" />
                <animateTransform attributeName="transform" type="rotate" values="0;180;360" dur={`${dur * 0.7}s`} repeatCount="indefinite" />
              </ellipse>
            );
          })}
        </g>
      );
    case "pine":
      return (
        <g>
          <rect x="-1" y="-6" width="2" height="6" rx="0.8" fill="#5D4E37" />
          <polygon points="0,-18 -6,-10 6,-10" fill="#2E7D32" />
          <polygon points="0,-15 -5,-8 5,-8" fill="#388E3C" />
          <polygon points="0,-12 -4,-6 4,-6" fill="#43A047" />
        </g>
      );
    case "willow":
      return (
        <g>
          <rect x="-1.2" y="-10" width="2.4" height="10" rx="1" fill="#6B5344" />
          <ellipse cx="0" cy="-12" rx="7" ry="5" fill="#66BB6A" opacity="0.6" />
          {/* Drooping branches */}
          <path d="M-5,-10 Q-7,-5 -8,0" stroke="#4CAF50" strokeWidth="0.8" fill="none" opacity="0.7" />
          <path d="M-3,-11 Q-5,-5 -6,1" stroke="#66BB6A" strokeWidth="0.7" fill="none" opacity="0.6" />
          <path d="M3,-11 Q5,-5 6,1" stroke="#66BB6A" strokeWidth="0.7" fill="none" opacity="0.6" />
          <path d="M5,-10 Q7,-5 8,0" stroke="#4CAF50" strokeWidth="0.8" fill="none" opacity="0.7" />
          <path d="M0,-12 Q1,-6 0,0" stroke="#81C784" strokeWidth="0.6" fill="none" opacity="0.5" />
        </g>
      );
    case "oak":
      return (
        <g>
          <rect x="-2" y="-10" width="4" height="10" rx="1.5" fill="#5D4E37" />
          <rect x="-1.2" y="-9" width="2.4" height="8" rx="1" fill="#6B5B47" opacity="0.5" />
          <ellipse cx="0" cy="-14" rx="10" ry="7" fill="#558B2F" />
          <ellipse cx="-4" cy="-15" rx="6" ry="5" fill="#689F38" opacity="0.7" />
          <ellipse cx="4" cy="-13" rx="5.5" ry="4.5" fill="#7CB342" opacity="0.6" />
          <ellipse cx="0" cy="-17" rx="5" ry="3.5" fill="#8BC34A" opacity="0.4" />
        </g>
      );

    // ── Flowers ──
    case "tulips":
      return (
        <g>
          {[[-3, "#E53935"], [0, "#FDD835"], [3, "#AB47BC"]].map(([fx, c], i) => (
            <g key={i}>
              <line x1={Number(fx)} y1="0" x2={Number(fx)} y2="-6" stroke="#4CAF50" strokeWidth="0.8" />
              <ellipse cx={Number(fx)} cy={-7} rx="1.8" ry="2.5" fill={c as string} />
              <ellipse cx={Number(fx)} cy={-7.5} rx="1" ry="1.5" fill="white" opacity="0.2" />
            </g>
          ))}
        </g>
      );
    case "sunflowers":
      return (
        <g>
          <line x1="0" y1="0" x2="0" y2="-10" stroke="#4CAF50" strokeWidth="1.2" />
          <ellipse cx="-3" cy="-5" rx="2.5" ry="1.5" fill="#66BB6A" opacity="0.7" />
          <circle cx="0" cy="-12" r="4" fill="#FDD835" />
          <circle cx="0" cy="-12" r="2" fill="#795548" />
          <circle cx="0" cy="-12.5" r="1" fill="#5D4037" opacity="0.5" />
          {/* Petals hint */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
            <ellipse key={i}
              cx={Math.cos(deg * Math.PI / 180) * 4.5}
              cy={-12 + Math.sin(deg * Math.PI / 180) * 4.5}
              rx="1.8" ry="0.8"
              fill="#FFEB3B" opacity="0.6"
              transform={`rotate(${deg} 0 -12)`}
            />
          ))}
        </g>
      );
    case "roses":
      return (
        <g>
          {[[-2.5, -6], [1.5, -7], [0, -5]].map(([fx, fy], i) => (
            <g key={i}>
              <line x1={fx} y1="0" x2={fx} y2={fy} stroke="#388E3C" strokeWidth="0.7" />
              <circle cx={fx} cy={fy! - 1.5} r="2" fill="#E53935" />
              <circle cx={fx} cy={fy! - 2} r="1.2" fill="#C62828" opacity="0.6" />
              <circle cx={fx! - 0.3} cy={fy! - 2.2} r="0.4" fill="white" opacity="0.2" />
            </g>
          ))}
        </g>
      );
    case "lavender":
      return (
        <g>
          {[-2.5, 0, 2.5].map((fx, i) => (
            <g key={i}>
              <line x1={fx} y1="0" x2={fx} y2="-7" stroke="#66BB6A" strokeWidth="0.6" />
              {[-7, -6, -5, -4].map((fy, j) => (
                <ellipse key={j} cx={fx} cy={fy} rx="1" ry="0.6" fill="#9C27B0" opacity={0.6 + j * 0.1} />
              ))}
            </g>
          ))}
        </g>
      );

    // ── Decorations ──
    case "lantern":
      return (
        <g>
          <rect x="-0.5" y="-10" width="1" height="10" fill="#6B5344" />
          <rect x="-2.5" y="-14" width="5" height="5" rx="1" fill="#FFF8E1" opacity="0.9" />
          <rect x="-2.5" y="-14" width="5" height="5" rx="1" fill="#FFD54F" opacity="0.4" />
          <rect x="-3" y="-14.5" width="6" height="1" rx="0.3" fill="#795548" />
          <rect x="-3" y="-9.5" width="6" height="1" rx="0.3" fill="#795548" />
          {/* Inner flame flicker */}
          <ellipse cx="0" cy="-11.5" rx="0.8" ry="1.5" fill="#FFB300" opacity="0.6">
            <animate attributeName="ry" values="1.2;1.8;1.2" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0.7;0.5" dur="0.8s" repeatCount="indefinite" />
          </ellipse>
          {/* Warm glow — pulsing */}
          <circle cx="0" cy="-11.5" r="5" fill="#FFD54F" opacity="0.08">
            <animate attributeName="opacity" values="0.05;0.14;0.05" dur="3s" repeatCount="indefinite" />
            <animate attributeName="r" values="4;6;4" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="0" cy="-11.5" r="8" fill="#FFD54F" opacity="0.04">
            <animate attributeName="opacity" values="0.02;0.06;0.02" dur="4s" repeatCount="indefinite" />
          </circle>
        </g>
      );
    case "mushrooms":
      return (
        <g>
          {/* Big mushroom */}
          <rect x="-0.8" y="-4" width="1.6" height="4" rx="0.5" fill="#F5F5DC" />
          <ellipse cx="0" cy="-5" rx="4" ry="2.5" fill="#E53935" />
          <circle cx="-1.5" cy="-5.5" r="0.8" fill="white" opacity="0.7" />
          <circle cx="1.5" cy="-4.8" r="0.6" fill="white" opacity="0.6" />
          <circle cx="0" cy="-6" r="0.5" fill="white" opacity="0.5" />
          {/* Small mushroom */}
          <rect x="3.2" y="-2" width="1" height="2" rx="0.4" fill="#F5F5DC" />
          <ellipse cx="3.7" cy="-2.5" rx="2.2" ry="1.4" fill="#FF7043" />
          <circle cx="3" cy="-3" r="0.4" fill="white" opacity="0.6" />
        </g>
      );
    case "rock-garden":
      return (
        <g>
          <ellipse cx="0" cy="0" rx="8" ry="3" fill="#D7CCC8" opacity="0.3" />
          <ellipse cx="-2" cy="-1" rx="3" ry="2.5" fill="#9E9E9E" />
          <ellipse cx="-2" cy="-2" rx="2" ry="1.5" fill="#BDBDBD" opacity="0.5" />
          <ellipse cx="3" cy="0" rx="2" ry="1.8" fill="#8D8D8D" />
          <ellipse cx="0.5" cy="0.5" rx="1.5" ry="1.2" fill="#A0A0A0" opacity="0.7" />
        </g>
      );
    case "birdhouse":
      return (
        <g>
          <rect x="-0.5" y="-12" width="1" height="12" fill="#6B5344" />
          <rect x="-3.5" y="-16" width="7" height="5" rx="0.8" fill="#FFCC80" />
          <polygon points="0,-18 -4.5,-16 4.5,-16" fill="#E57373" />
          <circle cx="0" cy="-14" r="1.2" fill="#5D4037" />
          <rect x="-0.3" y="-13" width="0.6" height="1.5" fill="#8D6E63" />
        </g>
      );

    default:
      return <circle cx="0" cy="-3" r="3" fill="#ccc" opacity="0.5" />;
  }
}

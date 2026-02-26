"use client";

interface CreatureProps {
  stage: number;
  color: string;
  happy?: boolean;
  size?: number;
  bounce?: boolean;
}

export function Creature({ stage, color, happy = false, size = 52, bounce = false }: CreatureProps) {
  const c = color || "#6366f1";
  const R = parseInt(c.slice(1, 3), 16);
  const G = parseInt(c.slice(3, 5), 16);
  const B = parseInt(c.slice(5, 7), 16);
  const lt = `rgb(${Math.min(255, R + 65)},${Math.min(255, G + 65)},${Math.min(255, B + 65)})`;
  const dk = `rgb(${Math.max(0, R - 35)},${Math.max(0, G - 35)},${Math.max(0, B - 35)})`;
  const vlt = `rgb(${Math.min(255, R + 100)},${Math.min(255, G + 100)},${Math.min(255, B + 100)})`;

  const wrapStyle: React.CSSProperties = bounce
    ? { animation: "creatureBounce 0.5s cubic-bezier(0.34,1.56,0.64,1)" }
    : {};

  // Stage 0: Egg
  if (stage === 0) {
    return (
      <div style={wrapStyle}>
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
          <ellipse cx="32" cy="55" rx="10" ry="3" fill="rgba(0,0,0,0.06)" />
          <ellipse cx="32" cy="37" rx="12" ry="16" fill={c} />
          <ellipse cx="28" cy="31" rx="3.5" ry="5.5" fill="white" opacity="0.12" transform="rotate(-10 28 31)" />
          <path d="M22 34 Q27 29 32 33 Q37 29 42 34" stroke={lt} strokeWidth="1.5" fill="none" opacity="0.4" />
          <path d="M25 39 Q32 35 39 39" stroke={lt} strokeWidth="1" fill="none" opacity="0.3" />
        </svg>
      </div>
    );
  }

  // Stages 1-4: Parametric creature
  const sc = [0, 0.7, 0.82, 0.95, 1.1][stage];

  return (
    <div style={wrapStyle}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={{ overflow: "visible" }}>
        {/* Shadow */}
        <ellipse cx="32" cy="57" rx={10 * sc} ry={3 * sc} fill="rgba(0,0,0,0.05)" />

        <g transform={`translate(32,${stage >= 3 ? 34 : 36}) scale(${sc})`}>
          {/* Tail (stage 2+) */}
          {stage >= 2 && (
            <ellipse
              cx={stage >= 3 ? 17 : 14}
              cy={stage >= 3 ? 8 : 6}
              rx={3 + stage}
              ry={2 + stage * 0.5}
              fill={c}
              transform={`rotate(${20 + stage * 5})`}
            />
          )}

          {/* Ears (stage 1+) */}
          {stage >= 1 && (
            <>
              <ellipse cx="-11" cy={-14 - stage * 2} rx={4 + stage * 0.5} ry={5 + stage * 2} fill={c} transform="rotate(-8)" />
              <ellipse cx="11" cy={-14 - stage * 2} rx={4 + stage * 0.5} ry={5 + stage * 2} fill={c} transform="rotate(8)" />
              <ellipse cx="-11" cy={-14 - stage * 2} rx={2.5 + stage * 0.3} ry={3 + stage * 1.3} fill={lt} transform="rotate(-8)" opacity="0.5" />
              <ellipse cx="11" cy={-14 - stage * 2} rx={2.5 + stage * 0.3} ry={3 + stage * 1.3} fill={lt} transform="rotate(8)" opacity="0.5" />
            </>
          )}

          {/* Stage 4 golden sparkles */}
          {stage === 4 && (
            <>
              <circle cx="0" cy="-26" r="2" fill="#FFD700" opacity="0.8">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="-7" cy="-23" r="1.5" fill="#FFD700" opacity="0.6">
                <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.8s" repeatCount="indefinite" />
              </circle>
              <circle cx="7" cy="-23" r="1.5" fill="#FFD700" opacity="0.6">
                <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2s" repeatCount="indefinite" />
              </circle>
            </>
          )}

          {/* Body */}
          <ellipse cx="0" cy="0" rx={14 + stage} ry={13 + stage} fill={c} />
          {/* Belly highlight */}
          <ellipse cx="0" cy={2 + stage * 0.5} rx={8 + stage * 0.5} ry={7 + stage * 0.5} fill={lt} opacity="0.3" />

          {/* Arms & feet (stage 2+) */}
          {stage >= 2 && (
            <>
              <ellipse cx={-16 - stage} cy={1} rx={3.5 + stage * 0.3} ry={5 + stage * 0.3} fill={c} transform="rotate(12)" />
              <ellipse cx={16 + stage} cy={1} rx={3.5 + stage * 0.3} ry={5 + stage * 0.3} fill={c} transform="rotate(-12)" />
              <ellipse cx={-5 - stage * 0.5} cy={12 + stage} rx={4.5 + stage * 0.3} ry={2.5 + stage * 0.2} fill={dk} />
              <ellipse cx={5 + stage * 0.5} cy={12 + stage} rx={4.5 + stage * 0.3} ry={2.5 + stage * 0.2} fill={dk} />
            </>
          )}

          {/* Eye whites */}
          <circle cx="-5" cy="-2" r={4 + stage * 0.5} fill="white" />
          <circle cx="5" cy="-2" r={4 + stage * 0.5} fill="white" />

          {/* Pupils - star eyes for stage 4 happy */}
          {happy && stage >= 4 ? (
            <>
              <path d="M-5,-5.5 L-4.2,-3 L-1.5,-2 L-4.2,-1 L-5,1.5 L-5.8,-1 L-8.5,-2 L-5.8,-3Z" fill="#1a1a2e" />
              <path d="M5,-5.5 L5.8,-3 L8.5,-2 L5.8,-1 L5,1.5 L4.2,-1 L1.5,-2 L4.2,-3Z" fill="#1a1a2e" />
            </>
          ) : (
            <>
              <circle cx={happy ? -4 : -5} cy="-2" r={2.2 + stage * 0.3} fill="#1a1a2e" />
              <circle cx={happy ? 6 : 5} cy="-2" r={2.2 + stage * 0.3} fill="#1a1a2e" />
              <circle cx={happy ? -3.2 : -4.2} cy="-3.2" r={0.8 + stage * 0.1} fill="white" />
              <circle cx={happy ? 6.8 : 5.8} cy="-3.2" r={0.8 + stage * 0.1} fill="white" />
              <circle cx={happy ? -4.8 : -5.8} cy="-0.8" r={0.4} fill="white" opacity="0.6" />
              <circle cx={happy ? 5.2 : 4.2} cy="-0.8" r={0.4} fill="white" opacity="0.6" />
            </>
          )}

          {/* Cheek blush */}
          <ellipse cx={-10 - stage * 0.5} cy={2} rx={2.8} ry={1.8} fill={vlt} opacity={happy ? 0.5 : 0.3} />
          <ellipse cx={10 + stage * 0.5} cy={2} rx={2.8} ry={1.8} fill={vlt} opacity={happy ? 0.5 : 0.3} />

          {/* Mouth */}
          {happy ? (
            <path
              d={`M${-3 - stage * 0.3} ${4 + stage * 0.3} Q0 ${8 + stage} ${3 + stage * 0.3} ${4 + stage * 0.3}`}
              stroke="#1a1a2e" strokeWidth="1.5" fill="none" strokeLinecap="round"
            />
          ) : stage >= 2 ? (
            <path
              d={`M-3 ${4 + stage * 0.2} Q0 ${6 + stage * 0.3} 3 ${4 + stage * 0.2}`}
              stroke="#1a1a2e" strokeWidth="1.2" fill="none" strokeLinecap="round"
            />
          ) : (
            <ellipse cx="0" cy={5} rx="1.5" ry="1" fill="#1a1a2e" />
          )}

          {/* Happy sparkles (stage 2+) */}
          {happy && stage >= 2 && (
            <>
              <circle cx={-18 - stage} cy={-12 - stage} r="1.5" fill="#FFD700" opacity="0.6">
                <animate attributeName="opacity" values="0.3;0.9;0.3" dur="1.8s" repeatCount="indefinite" />
              </circle>
              <circle cx={18 + stage} cy={-14 - stage} r="1.2" fill="#FFD700" opacity="0.5">
                <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
              </circle>
            </>
          )}

          {/* Stage 1 ear nubs */}
          {stage === 1 && (
            <>
              <path d="M-12 -6 L-9 -12 L-6 -6" fill={lt} stroke="white" strokeWidth="0.5" opacity="0.7" />
              <path d="M6 -6 L9 -13 L12 -6" fill={lt} stroke="white" strokeWidth="0.5" opacity="0.7" />
            </>
          )}
        </g>
      </svg>
    </div>
  );
}

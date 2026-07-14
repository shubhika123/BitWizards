import React from "react";

interface DigitalTwinProps {
  height?: number;
  weight?: number;
  size?: string;
  activeCategory?: "TOP" | "BOTTOM" | "FOOTWEAR" | "ACCESSORY" | null;
}

export const DigitalTwin: React.FC<DigitalTwinProps> = ({
  height = 162,
  weight = 58,
  size = "S",
  activeCategory = null,
}) => {
  // Let's compute scale factors based on height and weight to make it a "proportional" digital twin!
  // Baseline: Height 162cm, Weight 58kg
  const heightScale = Math.max(0.85, Math.min(1.15, height / 162));
  const weightScale = Math.max(0.8, Math.min(1.2, weight / 58));

  // Determine highlight colors based on active category
  const getFillColor = (category: "TOP" | "BOTTOM" | "FOOTWEAR" | "ACCESSORY") => {
    if (activeCategory === category) {
      return "rgba(255, 63, 108, 0.15)"; // Soft Myntra Pink overlay
    }
    return "rgba(83, 87, 102, 0.04)"; // Cool neutral gray
  };

  const getStrokeColor = (category: "TOP" | "BOTTOM" | "FOOTWEAR" | "ACCESSORY") => {
    if (activeCategory === category) {
      return "#ff3f6c"; // Myntra Pink
    }
    return "#d1d5db"; // Light gray border
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-[360px] bg-white rounded-2xl p-4 border border-dashed border-myntra-border">
      {/* Background grid pattern for a "workspace/canvas" feel */}
      <div className="absolute inset-0 bg-[radial-gradient(#eaeaec_1px,transparent_1px)] [background-size:16px_16px] opacity-60 pointer-events-none rounded-2xl" />

      {/* SVG Mannequin */}
      <svg
        viewBox="0 0 200 400"
        className="w-full h-full max-h-[300px] transition-transform duration-500 ease-out z-10"
        style={{ transform: `scaleY(${heightScale}) scaleX(${weightScale})` }}
      >
        <defs>
          <linearGradient id="mannequinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f9fafb" />
            <stop offset="100%" stopColor="#f3f4f6" />
          </linearGradient>
          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.04" />
          </filter>
        </defs>

        {/* Head & Neck */}
        <g className="transition-all duration-300">
          {/* Head */}
          <ellipse
            cx="100"
            cy="45"
            rx="16"
            ry="22"
            fill="url(#mannequinGrad)"
            stroke="#d1d5db"
            strokeWidth="1.5"
            filter="url(#softShadow)"
          />
          {/* Neck */}
          <path
            d="M 94 65 L 94 78 L 106 78 L 106 65 Z"
            fill="url(#mannequinGrad)"
            stroke="#d1d5db"
            strokeWidth="1.5"
          />
        </g>

        {/* TOP / Torso Area */}
        <g className="transition-all duration-300">
          <path
            d="M 70 78 C 80 76, 120 76, 130 78 C 135 90, 132 120, 124 150 C 110 155, 90 155, 76 150 C 68 120, 65 90, 70 78 Z"
            fill={getFillColor("TOP")}
            stroke={getStrokeColor("TOP")}
            strokeWidth={activeCategory === "TOP" ? "2" : "1.5"}
            className="cursor-pointer hover:opacity-90 transition-all"
          />
          {/* Left Arm */}
          <path
            d="M 70 78 C 62 90, 58 110, 56 130 C 55 140, 58 150, 60 160 C 62 155, 64 145, 66 135 C 68 115, 70 95, 70 78"
            fill="url(#mannequinGrad)"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
          {/* Right Arm & Accessory highlight area */}
          <path
            d="M 130 78 C 138 90, 142 110, 144 130 C 145 140, 142 150, 140 160 C 138 155, 136 145, 134 135 C 132 115, 130 95, 130 78"
            fill={getFillColor("ACCESSORY")}
            stroke={getStrokeColor("ACCESSORY")}
            strokeWidth={activeCategory === "ACCESSORY" ? "1.5" : "1"}
            className="cursor-pointer hover:opacity-90 transition-all"
          />
        </g>

        {/* BOTTOM / Hips & Legs Area */}
        <g className="transition-all duration-300">
          {/* Hips / Shorts / Skirt Area */}
          <path
            d="M 76 150 C 82 152, 118 152, 124 150 C 128 175, 126 210, 122 230 C 112 235, 88 235, 78 230 C 74 210, 72 175, 76 150 Z"
            fill={getFillColor("BOTTOM")}
            stroke={getStrokeColor("BOTTOM")}
            strokeWidth={activeCategory === "BOTTOM" ? "2" : "1.5"}
            className="cursor-pointer hover:opacity-90 transition-all"
          />
          {/* Left Leg */}
          <path
            d="M 80 230 C 82 260, 84 290, 86 330 C 86 340, 84 350, 82 360 C 86 360, 90 355, 92 345 C 94 315, 96 280, 98 231"
            fill="url(#mannequinGrad)"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
          {/* Right Leg */}
          <path
            d="M 120 230 C 118 260, 116 290, 114 330 C 114 340, 116 350, 118 360 C 114 360, 110 355, 108 345 C 106 315, 104 280, 102 231"
            fill="url(#mannequinGrad)"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        </g>

        {/* FOOTWEAR / Feet Area */}
        <g className="transition-all duration-300">
          {/* Left Foot */}
          <path
            d="M 82 360 C 80 365, 76 370, 72 372 C 74 375, 84 375, 88 372 C 86 368, 84 364, 82 360"
            fill={getFillColor("FOOTWEAR")}
            stroke={getStrokeColor("FOOTWEAR")}
            strokeWidth={activeCategory === "FOOTWEAR" ? "2" : "1.5"}
            className="cursor-pointer hover:opacity-90 transition-all"
          />
          {/* Right Foot */}
          <path
            d="M 118 360 C 120 365, 124 370, 128 372 C 126 375, 116 375, 112 372 C 114 368, 116 364, 118 360"
            fill={getFillColor("FOOTWEAR")}
            stroke={getStrokeColor("FOOTWEAR")}
            strokeWidth={activeCategory === "FOOTWEAR" ? "2" : "1.5"}
            className="cursor-pointer hover:opacity-90 transition-all"
          />
        </g>
      </svg>

      {/* Proportional Specs Badge */}
      <div className="mt-4 flex items-center justify-center gap-2 bg-myntra-gray px-3 py-1.5 rounded-full text-xs font-semibold text-myntra-dark border border-myntra-border z-10">
        <span className="w-2 h-2 rounded-full bg-[#34d399]" />
        <span>{height} cm</span>
        <span className="text-gray-300">•</span>
        <span>{weight} kg</span>
        <span className="text-gray-300">•</span>
        <span>Size {size}</span>
      </div>
    </div>
  );
};

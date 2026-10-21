import React from 'react';

interface StreamNestLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTextLabel?: boolean;
  variant?: 'yellow-blob' | 'green-blob';
}

export const StreamNestLogo: React.FC<StreamNestLogoProps> = ({
  className = '',
  size = 'md',
  showTextLabel = true,
  variant = 'yellow-blob',
}) => {
  // Size presets optimized for tight viewBox
  const sizeMap = {
    xs: 'h-8 w-auto',
    sm: 'h-10 w-auto',
    md: 'h-12 w-auto',
    lg: 'h-16 w-auto',
    xl: 'h-24 w-auto',
  };

  const currentSizeClass = sizeMap[size] || 'h-12 w-auto';
  const isSwitched = variant === 'yellow-blob';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Authentic StreamNest Organic Blob with Chunky Bubbly Typography */}
      <svg
        viewBox="40 30 290 250"
        className={`${currentSizeClass} shrink-0 transition-transform duration-300 filter drop-shadow-[0_4px_12px_rgba(250,204,21,0.25)]`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="StreamNest Logo"
      >
        <defs>
          {isSwitched ? (
            <>
              {/* Switched Color Palette: Radiant Golden-Yellow Blob + Deep Forest Green Lettering */}
              {/* Golden Yellow Fluid Blob Gradient */}
              <linearGradient id="sn-blob-grad-switched" x1="60" y1="40" x2="310" y2="265" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="25%" stopColor="#FDE047" />
                <stop offset="65%" stopColor="#FACC15" />
                <stop offset="100%" stopColor="#EAB308" />
              </linearGradient>

              {/* Blob Inner Depth / 3D Bevel */}
              <radialGradient id="sn-blob-depth-switched" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
                <stop offset="45%" stopColor="#FDE047" stopOpacity="0" />
                <stop offset="100%" stopColor="#CA8A04" stopOpacity="0.6" />
              </radialGradient>

              {/* Deep Forest & Emerald Green Lettering Gradient */}
              <linearGradient id="sn-letter-grad-switched" x1="80" y1="75" x2="270" y2="215" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#065F46" />
                <stop offset="40%" stopColor="#047857" />
                <stop offset="80%" stopColor="#064E3B" />
                <stop offset="100%" stopColor="#022C22" />
              </linearGradient>

              {/* Ambient Golden Outer Glow */}
              <filter id="sn-glow-switched" x="-15%" y="-15%" width="130%" height="130%">
                <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#EAB308" floodOpacity="0.4" />
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.5" />
              </filter>

              {/* Crisp 3D Letter Drop Shadow on the Yellow Blob */}
              <filter id="sn-letter-shadow-switched" x="-10%" y="-10%" width="125%" height="125%">
                <feDropShadow dx="0" dy="3.5" stdDeviation="1.5" floodColor="#713F12" floodOpacity="0.75" />
              </filter>
            </>
          ) : (
            <>
              {/* Classic Color Palette: Forest Green Blob + Golden Yellow Lettering */}
              <linearGradient id="sn-blob-grad-classic" x1="50" y1="30" x2="330" y2="260" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1E5C38" />
                <stop offset="45%" stopColor="#174A2D" />
                <stop offset="100%" stopColor="#103820" />
              </linearGradient>

              <radialGradient id="sn-blob-depth-classic" cx="35%" cy="30%" r="55%">
                <stop offset="0%" stopColor="#2E7D4E" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#174A2D" stopOpacity="0" />
              </radialGradient>

              <linearGradient id="sn-letter-grad-classic" x1="100" y1="70" x2="280" y2="210" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFC83B" />
                <stop offset="30%" stopColor="#F5A823" />
                <stop offset="100%" stopColor="#E39414" />
              </linearGradient>

              <filter id="sn-letter-shadow-classic" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0" dy="4" stdDeviation="2" floodColor="#0A2213" floodOpacity="0.8" />
              </filter>
            </>
          )}
        </defs>

        {/* --- 1. Organic Fluid Blob Background --- */}
        <g filter={isSwitched ? "url(#sn-glow-switched)" : undefined}>
          {/* Ambient Ground Shadow */}
          <path
            d="M 95 72
               C 125 45, 185 38, 235 48
               C 275 56, 305 85, 302 120
               C 300 135, 288 145, 286 160
               C 284 185, 320 205, 310 235
               C 298 268, 250 270, 205 258
               C 175 250, 160 272, 135 270
               C 105 268, 85 240, 90 205
               C 93 182, 60 168, 55 142
               C 50 112, 68 88, 95 72 Z"
            fill="#000000"
            opacity="0.5"
            transform="translate(1, 5)"
          />

          {/* Main Organic Blob Shape */}
          <path
            d="M 95 72
               C 125 45, 185 38, 235 48
               C 275 56, 305 85, 302 120
               C 300 135, 288 145, 286 160
               C 284 185, 320 205, 310 235
               C 298 268, 250 270, 205 258
               C 175 250, 160 272, 135 270
               C 105 268, 85 240, 90 205
               C 93 182, 60 168, 55 142
               C 50 112, 68 88, 95 72 Z"
            fill={isSwitched ? "url(#sn-blob-grad-switched)" : "url(#sn-blob-grad-classic)"}
            stroke={isSwitched ? "#D97706" : "#34D399"}
            strokeWidth={isSwitched ? "2" : "2.5"}
            strokeLinejoin="round"
          />

          {/* Internal Depth Highlight */}
          <path
            d="M 95 72
               C 125 45, 185 38, 235 48
               C 275 56, 305 85, 302 120
               C 300 135, 288 145, 286 160
               C 284 185, 320 205, 310 235
               C 298 268, 250 270, 205 258
               C 175 250, 160 272, 135 270
               C 105 268, 85 240, 90 205
               C 93 182, 60 168, 55 142
               C 50 112, 68 88, 95 72 Z"
            fill={isSwitched ? "url(#sn-blob-depth-switched)" : "url(#sn-blob-depth-classic)"}
            pointerEvents="none"
          />
        </g>

        {/* --- 2. Chubby Bubbly 'stream' and 'nest' Letterforms --- */}
        <g filter={isSwitched ? "url(#sn-letter-shadow-switched)" : "url(#sn-letter-shadow-classic)"}>
          {/* Outlines Layer: Dark Pine Green (#012017) when switched, or Dark Forest Green when classic */}
          <g
            stroke={isSwitched ? "#012017" : "#0D2F1A"}
            strokeWidth={isSwitched ? "10" : "11"}
            strokeLinejoin="round"
            strokeLinecap="round"
          >
            {/* --- LINE 1: 'stream' --- */}

            {/* 's' */}
            <path
              d="M 94 105
                 C 94 92, 72 90, 72 101
                 C 72 114, 95 116, 95 132
                 C 95 148, 68 150, 60 139
                 C 58 135, 62 128, 68 128
                 C 72 128, 74 133, 79 135
                 C 83 136, 85 133, 85 129
                 C 85 118, 62 116, 62 101
                 C 62 86, 85 82, 98 94
                 C 101 97, 98 105, 94 105 Z"
              fill={isSwitched ? "url(#sn-letter-grad-switched)" : "url(#sn-letter-grad-classic)"}
            />

            {/* 't' */}
            <path
              d="M 103 88 L 103 98 L 97 98 C 94 98, 93 102, 93 105 L 103 105 L 103 133 C 103 144, 110 148, 120 146 C 123 145, 124 140, 122 137 C 120 135, 116 135, 114 134 C 112 133, 112 130, 112 126 L 112 105 L 123 105 C 126 105, 127 101, 127 98 C 127 95, 125 88, 121 88 L 112 88 L 112 82 C 112 79, 108 77, 105 79 C 103 80, 103 84, 103 88 Z"
              fill={isSwitched ? "url(#sn-letter-grad-switched)" : "url(#sn-letter-grad-classic)"}
            />

            {/* 'r' */}
            <path
              d="M 129 98
                 L 129 143 C 129 146, 133 148, 137 148 C 141 148, 144 145, 144 142
                 L 144 116
                 C 147 106, 153 103, 160 105
                 C 163 106, 166 103, 166 99
                 C 166 94, 160 92, 152 94
                 C 145 96, 140 101, 138 107
                 L 138 98 C 138 94, 134 92, 129 98 Z"
              fill={isSwitched ? "url(#sn-letter-grad-switched)" : "url(#sn-letter-grad-classic)"}
            />

            {/* 'e' */}
            <path
              d="M 183 118
                 C 183 103, 172 94, 158 97
                 C 145 100, 142 116, 143 130
                 C 144 143, 156 148, 171 145
                 C 176 144, 178 138, 175 135
                 C 172 133, 167 134, 162 134
                 C 154 134, 151 129, 151 124
                 L 182 124
                 C 183 124, 183 121, 183 118 Z
                 M 152 115
                 C 153 109, 157 105, 162 105
                 C 167 105, 171 109, 172 115
                 L 152 115 Z"
              fill={isSwitched ? "url(#sn-letter-grad-switched)" : "url(#sn-letter-grad-classic)"}
            />

            {/* 'a' */}
            <path
              d="M 215 100
                 C 211 96, 203 94, 194 95
                 C 183 96, 177 102, 177 107
                 C 177 113, 185 116, 194 116
                 L 204 116
                 C 204 128, 198 134, 189 134
                 C 183 134, 180 131, 180 128
                 C 180 125, 176 123, 172 124
                 C 168 125, 167 130, 169 135
                 C 174 144, 186 147, 198 146
                 C 212 145, 219 136, 219 120
                 L 219 104
                 C 219 102, 217 101, 215 100 Z
                 M 204 107
                 L 194 107
                 C 190 107, 187 106, 187 103
                 C 187 101, 191 100, 195 100
                 C 200 100, 204 102, 204 107 Z"
              fill={isSwitched ? "url(#sn-letter-grad-switched)" : "url(#sn-letter-grad-classic)"}
            />

            {/* 'm' */}
            <path
              d="M 226 98
                 L 226 142 C 226 146, 230 148, 234 148 C 238 148, 241 146, 241 142
                 L 241 117
                 C 243 108, 249 104, 255 105
                 C 260 106, 263 111, 263 118
                 L 263 142 C 263 146, 267 148, 271 148 C 275 148, 278 146, 278 142
                 L 278 117
                 C 280 108, 286 104, 292 105
                 C 297 106, 300 110, 300 118
                 L 300 142 C 300 146, 304 148, 308 148 C 312 148, 315 146, 315 142
                 L 315 115
                 C 315 102, 307 94, 296 95
                 C 288 96, 282 101, 279 107
                 C 276 100, 269 96, 261 95
                 C 253 94, 246 98, 242 105
                 L 242 98 C 242 94, 237 92, 226 98 Z"
              fill={isSwitched ? "url(#sn-letter-grad-switched)" : "url(#sn-letter-grad-classic)"}
            />

            {/* --- LINE 2: 'nest' --- */}

            {/* 'n' */}
            <path
              d="M 104 165
                 L 104 209 C 104 213, 108 215, 112 215 C 116 215, 119 213, 119 209
                 L 119 184
                 C 121 175, 128 171, 135 172
                 C 142 173, 146 178, 146 186
                 L 146 209 C 146 213, 150 215, 154 215 C 158 215, 161 213, 161 209
                 L 161 182
                 C 161 169, 152 161, 140 162
                 C 131 163, 124 168, 120 175
                 L 120 165 C 120 161, 115 159, 104 165 Z"
              fill={isSwitched ? "url(#sn-letter-grad-switched)" : "url(#sn-letter-grad-classic)"}
            />

            {/* 'e' */}
            <path
              d="M 205 185
                 C 205 170, 194 161, 180 164
                 C 167 167, 164 183, 165 197
                 C 166 210, 178 215, 193 212
                 C 198 211, 200 205, 197 202
                 C 194 200, 189 201, 184 201
                 C 176 201, 173 196, 173 191
                 L 204 191
                 C 205 191, 205 188, 205 185 Z
                 M 174 182
                 C 175 176, 179 172, 184 172
                 C 189 172, 193 176, 194 182
                 L 174 182 Z"
              fill={isSwitched ? "url(#sn-letter-grad-switched)" : "url(#sn-letter-grad-classic)"}
            />

            {/* 's' */}
            <path
              d="M 239 172
                 C 239 159, 217 157, 217 168
                 C 217 181, 240 183, 240 199
                 C 240 215, 213 217, 205 206
                 C 203 202, 207 195, 213 195
                 C 217 195, 219 200, 224 202
                 C 228 203, 230 200, 230 196
                 C 230 185, 207 183, 207 168
                 C 207 153, 230 149, 243 161
                 C 246 164, 243 172, 239 172 Z"
              fill={isSwitched ? "url(#sn-letter-grad-switched)" : "url(#sn-letter-grad-classic)"}
            />

            {/* 't' */}
            <path
              d="M 252 155 L 252 165 L 246 165 C 243 165, 242 169, 242 172 L 252 172 L 252 200 C 252 211, 259 215, 269 213 C 272 212, 273 207, 271 204 C 269 202, 265 202, 263 201 C 261 200, 261 197, 261 193 L 261 172 L 272 172 C 275 172, 276 168, 276 165 C 276 162, 274 155, 270 155 L 261 155 L 261 149 C 261 146, 257 144, 254 146 C 252 147, 252 151, 252 155 Z"
              fill={isSwitched ? "url(#sn-letter-grad-switched)" : "url(#sn-letter-grad-classic)"}
            />
          </g>

          {/* Crisp Light Reflection Accents on Letters for 3D retro pop */}
          {isSwitched && (
            <g fill="#A7F3D0" opacity="0.65" pointerEvents="none">
              {/* 's' highlight */}
              <circle cx="85" cy="98" r="2.5" />
              {/* 't' highlight */}
              <circle cx="108" cy="95" r="2" />
              {/* 'r' highlight */}
              <circle cx="152" cy="100" r="2.5" />
              {/* 'e' highlight */}
              <circle cx="168" cy="103" r="2" />
              {/* 'a' highlight */}
              <circle cx="204" cy="101" r="2.5" />
              {/* 'm' highlights */}
              <circle cx="253" cy="104" r="2" />
              <circle cx="290" cy="104" r="2" />
              {/* 'n' highlight */}
              <circle cx="138" cy="172" r="2.5" />
              {/* 'e' highlight */}
              <circle cx="188" cy="172" r="2.5" />
              {/* 's' highlight */}
              <circle cx="230" cy="166" r="2.5" />
              {/* 't' highlight */}
              <circle cx="264" cy="163" r="2" />
            </g>
          )}
        </g>
      </svg>

      {/* Sleek Complementary Brand Wordmark Label */}
      {showTextLabel && (
        <div className="flex flex-col justify-center leading-none">
          <div className="font-extrabold tracking-tight text-xl sm:text-2xl font-display flex items-center gap-0.5">
            <span className="text-amber-600 drop-shadow-xs">Stream</span>
            <span className="text-emerald-800 drop-shadow-xs">Nest</span>
          </div>
          <span className="text-[9px] font-mono tracking-widest uppercase text-emerald-700 font-bold pl-0.5">
            CINEMATIC OTT
          </span>
        </div>
      )}
    </div>
  );
};

export default StreamNestLogo;

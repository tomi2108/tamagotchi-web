import { Flower2, Heart } from "lucide-react";

type TombstoneProps = {
  name: string;
  dead_at: string;
};

export default function Tombstone({ name, dead_at }: TombstoneProps) {
  const date = new Date(dead_at).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="relative flex min-h-72 flex-col items-center justify-end overflow-hidden rounded-lg bg-gradient-to-b from-[#171e25] to-[#202b2b] px-4 pt-6">
      <div className="absolute left-6 top-5 size-1 rounded-full bg-[#b5b9a0]" />
      <div className="absolute right-10 top-10 size-1 rounded-full bg-[#b5b9a0]" />
      <div className="absolute right-6 top-4 size-0.5 rounded-full bg-[#b5b9a0]" />

      <div className="relative z-10 flex w-44 flex-col items-center">
        <svg viewBox="0 0 176 190" className="w-full drop-shadow-xl" aria-hidden="true">
          <defs>
            <linearGradient id="stone-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#777f7d" />
              <stop offset="55%" stopColor="#555e5d" />
              <stop offset="100%" stopColor="#394443" />
            </linearGradient>
          </defs>

          <path
            d="M15 190 V61 C15 28 43 8 88 8 S161 28 161 61 V190 Z"
            fill="url(#stone-gradient)"
            stroke="#929995"
            strokeWidth="2"
          />

          <path
            d="M24 185 V62 C24 35 49 17 88 17 S152 35 152 62 V185"
            fill="none"
            stroke="#a0a7a0"
            strokeOpacity="0.45"
            strokeWidth="1.5"
          />

          <path
            d="M36 185 V65 C36 44 55 29 88 29 S140 44 140 65 V185"
            fill="none"
            stroke="#303a38"
            strokeOpacity="0.55"
            strokeWidth="1"
          />

          <path
            d="M67 55 Q88 43 109 55"
            fill="none"
            stroke="#bdc2b7"
            strokeOpacity="0.7"
            strokeWidth="1.5"
          />

          <path
            d="M64 153 Q88 163 112 153"
            fill="none"
            stroke="#bdc2b7"
            strokeOpacity="0.5"
            strokeWidth="1"
          />
        </svg>

        <div className="absolute inset-x-6 top-[31%] flex flex-col items-center text-center">
          <Heart className="mb-2 size-5 text-[#c4b6a0]" strokeWidth={1.5} />

          <h2
            className="max-w-full break-words font-pixel text-[16px] leading-relaxed text-[#e0d8c5] [text-shadow:0_1px_1px_#303a38]"
          >
            {name}
          </h2>

          <div className="my-3 h-px w-12 bg-[#b8b7a5]/60" />

          <p className="font-mono text-[14px] text-[#d0cabb]">{date}</p>
        </div>
      </div>

      {/* Grass and flowers */}
      <div className="absolute inset-x-0 bottom-0 h-10 bg-[#273b31]">
        <div className="absolute -top-2 left-0 h-4 w-full rounded-[50%] bg-[#273b31]" />
      </div>

      <Flower2 className="absolute bottom-5 left-7 size-5 text-[#c3a6b5]" strokeWidth={1.5} />
      <Flower2 className="absolute bottom-4 right-8 size-4 text-[#d1c5a0]" strokeWidth={1.5} />
      <div className="absolute bottom-3 left-1/2 size-2 -translate-x-12 rounded-full bg-[#8caa85]" />
      <div className="absolute bottom-5 left-1/2 size-2 translate-x-10 rounded-full bg-[#8caa85]" />
    </div>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.max(Math.min(n, max), min);
}

interface StarsProps {
  score: number;
  large?: boolean;
}

export function Stars({ score, large }: StarsProps) {
  const clampedScore = clamp(score / 2, 0, 5);
  const starPercentages = [0, 0, 0, 0, 0];

  for (let i = 0; i < clampedScore; i++) {
    starPercentages[i] = 1;
  }

  if (clampedScore < 5) {
    // Set last star to the fraction of the score
    starPercentages[Math.trunc(clampedScore)] = clampedScore % 1;
  }

  const [w, h] = large ? ["w-10", "h-10"] : ["w-4", "h-4"];

  return (
    <div className="no-animation inline-flex w-max gap-px px-0 pb-2">
      {starPercentages.map((perc, i) => (
        <div key={i + "star"} className={`relative ${w} ${h}`}>
          <div
            style={{ width: `${perc * 100}%` }}
            className={`absolute ${h} overflow-hidden`}
          >
            <div className={`mask mask-star-2 ${w} ${h} bg-secondary`}></div>
          </div>
          <div className={`mask mask-star-2 ${w} ${h} bg-secondary/20`}></div>
        </div>
      ))}
    </div>
  );
  return <></>;
}

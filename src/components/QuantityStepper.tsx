"use client";

type Props = {
  value: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
};

export function QuantityStepper({ value, max, onChange, label }: Props) {
  return (
    <div className="inline-flex items-center rounded-md border border-line bg-white">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        className="h-8 w-8 text-lg leading-none hover:bg-paper"
        aria-label={`Retirer un ${label}`}
      >
        −
      </button>
      <span className="w-8 text-center tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        className="h-8 w-8 text-lg leading-none hover:bg-paper disabled:opacity-30"
        aria-label={`Ajouter un ${label}`}
      >
        +
      </button>
    </div>
  );
}

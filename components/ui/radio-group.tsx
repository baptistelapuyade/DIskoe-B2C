import { cn } from "@/lib/utils";

// A group of native radio buttons (Figma EVT-07m-c, 07m-d): one answer of a
// list. Native inputs carry the state, so it works by keyboard and with a
// screen reader. Every row is at least 44 px high. The state is held by the
// caller. `aria-invalid` sits on the group (a radio does not support it), and
// an invalid group can take focus, so that the screen can send the focus to
// the first marked control.
export type RadioOption = { value: string; label: string };

export function RadioGroup({
  name,
  labelledBy,
  describedBy,
  value,
  options,
  disabled = false,
  invalid = false,
  onChange,
}: {
  name: string;
  // The id of the heading that names the group.
  labelledBy: string;
  describedBy?: string;
  value: string;
  options: readonly RadioOption[];
  disabled?: boolean;
  invalid?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-invalid={invalid ? true : undefined}
      tabIndex={invalid ? -1 : undefined}
      className="focus-visible:outline-ring flex flex-col focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "flex min-h-11 items-center gap-3 text-base",
            disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
          )}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            disabled={disabled}
            onChange={() => onChange(option.value)}
            className={cn(
              "border-border-strong bg-input checked:border-primary size-4 shrink-0 appearance-none rounded-full border checked:border-[5px]",
              "focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2",
            )}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}

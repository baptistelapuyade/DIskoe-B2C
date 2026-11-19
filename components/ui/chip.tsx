// DISKOE / Atmosphere Chip (Figma 2454:235): a pill that toggles. A native
// checkbox carries the state, so it works by keyboard and with a screen
// reader. The state is held by the caller (the step counts the chosen terms).
export function AtmosphereChip({
  value,
  label,
  checked,
  disabled = false,
  onChange,
}: {
  value: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={`relative inline-flex ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <input
        type="checkbox"
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span className="border-border bg-background text-foreground peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:outline-ring inline-flex items-center rounded-full border-[1.5px] p-3 text-sm leading-5 font-medium peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">
        {label}
      </span>
    </label>
  );
}

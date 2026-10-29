// DISKOE / Atmosphere Chip (Figma 2454:235): a pill that toggles. A native
// checkbox carries the state, so it works without script and by keyboard.
export function AtmosphereChip({
  name,
  value,
  label,
  defaultChecked,
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="relative inline-flex cursor-pointer">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span className="border-border bg-background text-foreground peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:outline-ring inline-flex items-center rounded-full border-[1.5px] p-3 text-sm leading-5 font-medium peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">
        {label}
      </span>
    </label>
  );
}

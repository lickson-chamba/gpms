export function DateSearchForm({
  defaultCheckIn,
  defaultCheckOut,
}: {
  defaultCheckIn?: string;
  defaultCheckOut?: string;
}) {
  return (
    <form action="/" className="flex flex-wrap items-end gap-3">
      <label className="block">
        <span className="text-sm text-paper/80">Check-in</span>
        <input
          type="date"
          name="check_in"
          defaultValue={defaultCheckIn}
          className="mt-1 block rounded-sm border border-paper/30 bg-paper/10 px-3 py-2 text-paper [color-scheme:dark]"
        />
      </label>
      <label className="block">
        <span className="text-sm text-paper/80">Check-out</span>
        <input
          type="date"
          name="check_out"
          defaultValue={defaultCheckOut}
          className="mt-1 block rounded-sm border border-paper/30 bg-paper/10 px-3 py-2 text-paper [color-scheme:dark]"
        />
      </label>
      <button
        type="submit"
        className="rounded-sm bg-brick px-5 py-2 font-medium text-paper transition-colors hover:bg-brick-dark"
      >
        Check availability
      </button>
    </form>
  );
}

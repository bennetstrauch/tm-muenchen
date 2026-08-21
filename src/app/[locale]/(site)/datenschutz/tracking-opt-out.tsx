"use client";

// Widerspruch (opt-out) for track_without_consent tenants: writes the declined
// choice and reloads so the Pixel no longer loads on the next paint. See ADR 0011.
export default function TrackingOptOut({ label }: { label: string }) {
  function optOut() {
    localStorage.setItem("tm_cookie_consent", "declined");
    location.reload();
  }
  return (
    <button
      type="button"
      onClick={optOut}
      className="underline underline-offset-2 hover:text-[#1A3352] transition-colors"
    >
      {label}
    </button>
  );
}

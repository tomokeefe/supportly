export function Footer() {
  return (
    <footer className="border-t border-border bg-cream">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 flex items-center justify-between">
        <span className="heading-editorial text-dark text-lg">
          Supportly
        </span>
        <p className="text-sm text-[--color-text-secondary]">
          &copy; {new Date().getFullYear()} Supportly. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

import NavMenu from "./nav-menu";
import TopBarLogo from "./logo";
import ContactButtons from "./contact-buttons";
import LocaleSwitcher from "./locale-switcher";

export default function TopBar({ showWhatsApp }: { showWhatsApp?: boolean }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-[9998] h-14 flex items-center px-5 bg-white/10 backdrop-blur-md border-b border-white/15">
      <NavMenu />
      <LocaleSwitcher />
      {/* Absolutely centered so it's always in the true middle of the header */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <TopBarLogo />
      </div>
      <div className="ml-auto">
        <ContactButtons showWhatsApp={showWhatsApp} />
      </div>
    </header>
  );
}

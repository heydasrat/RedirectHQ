import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  Check,
  Copy,
  Link2,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";

import { logout } from "../../app/features/authSlice";
import { addUrl } from "../../app/features/urlSlice.js";
import api from "../Axios/Axios";
import { shortUrlFor } from "../../utils/shortUrl.js";

const NAV_LINKS = [
  { to: "/", label: "Dashboard" },
  { to: "/links", label: "My links" },
  // { to: "/analytics", label: "Analytics" },
];

const Logo = ({ isDark }) => {
  return (
    <Link
      to="/"
      className="flex items-center gap-2.5"
      aria-label="RedirectHQ home"
    >
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-white">
        <svg
          viewBox="0 0 24 24"
          className="h-[18px] w-[18px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 18v-3a5 5 0 0 1 5-5h11" />
          <path d="m16 5 4 5-4 5" />
        </svg>
      </span>

      <span
        className={`text-lg font-semibold tracking-tight ${
          isDark ? "text-white" : "text-slate-900"
        }`}
      >
        Redirect<span className="text-blue-600">HQ</span>
      </span>
    </Link>
  );
};

const ShortenForm = ({ className = "", isDark }) => {
  const dispatch = useDispatch();

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [copied, setCopied] = useState(false);

  function normalize(value) {
    const trimmed = value.trim();

    if (!trimmed) return null;

    const withProtocol = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;

    try {
      const parsed = new URL(withProtocol);

      if (!parsed.hostname.includes(".")) {
        return null;
      }

      return parsed.toString();
    } catch {
      return null;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setShortUrl("");

    const cleanUrl = normalize(url);

    if (!cleanUrl) {
      setError("Enter a valid URL, like example.com/my-page");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/url", {
        originalUrl: cleanUrl,
      });

      if (response.data.success) {
        const createdUrl = response.data.data;

        dispatch(addUrl(createdUrl));

        setShortUrl(shortUrlFor(createdUrl.shortCode));
        setUrl("");
      } else {
        setError(
          response.data.message || "Couldn't shorten this link."
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't shorten this link. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!shortUrl) return;

    try {
      await navigator.clipboard.writeText(shortUrl);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setError(
        "Couldn't copy. Select the link and copy it manually."
      );
    }
  }

  const formClass = isDark
    ? "border-white/10 bg-white/[0.04] focus-within:border-[#1F8A70] focus-within:ring-[#1F8A70]/20"
    : "border-slate-300 bg-white focus-within:border-blue-600 focus-within:ring-blue-600/20";

  const inputClass = isDark
    ? "text-white placeholder:text-white/30"
    : "text-slate-900 placeholder:text-slate-400";

  const buttonClass = isDark
    ? "bg-[#1F8A70] hover:bg-[#23997d] disabled:bg-white/10 disabled:text-white/30"
    : "bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400";

  const resultClass = isDark
    ? "border-white/10 bg-[#131A22] shadow-black/30"
    : "border-slate-200 bg-white shadow-lg";

  const resultLinkClass = isDark
    ? "text-[#4CC2A2] hover:underline"
    : "text-blue-700 hover:underline";

  const copyButtonClass = isDark
    ? "border-white/10 text-white/70 hover:bg-white/5"
    : "border-slate-200 text-slate-700 hover:bg-slate-50";

  const dismissClass = isDark
    ? "text-white/35 hover:bg-white/10 hover:text-white/70"
    : "text-slate-400 hover:bg-slate-100 hover:text-slate-700";

  return (
    <div className={`relative ${className}`}>
      <form
        onSubmit={handleSubmit}
        className={`flex items-center gap-1 rounded-xl border p-1 transition focus-within:ring-2 ${formClass}`}
      >
        <Link2
          className={`ml-2 h-4 w-4 shrink-0 ${
            isDark ? "text-white/35" : "text-slate-400"
          }`}
          aria-hidden="true"
        />

        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a long link"
          aria-label="Long URL to shorten"
          className={`ui-input min-w-0 flex-1 bg-transparent px-1 py-1.5 text-sm outline-none ${inputClass}`}
        />

        <button
          type="submit"
          disabled={loading || !url.trim()}
          className={`ui-button-primary rounded-lg px-3.5 py-1.5 text-sm font-medium text-white transition disabled:cursor-not-allowed ${buttonClass}`}
        >
          {loading ? "Shortening..." : "Shorten"}
        </button>
      </form>

      {error && (
        <p
          role="alert"
          className="mt-1.5 px-1 text-xs text-red-500"
        >
          {error}
        </p>
      )}

      {shortUrl && (
        <div
          className={`absolute left-0 right-0 top-full z-50 mt-2 flex items-center gap-2 rounded-xl border p-2.5 ${resultClass}`}
        >
          <a
            href={shortUrl}
            target="_blank"
            rel="noreferrer"
            className={`min-w-0 flex-1 truncate text-sm font-medium ${resultLinkClass}`}
          >
            {shortUrl}
          </a>

          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${copyButtonClass}`}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}

            {copied ? "Copied" : "Copy"}
          </button>

          <button
            type="button"
            onClick={() => setShortUrl("")}
            aria-label="Dismiss"
            className={`rounded-lg p-1.5 transition ${dismissClass}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const userMenuRef = useRef(null);

  const theme = user?.preferences?.theme || "light";
  const isDark = theme === "dark";

  const displayName =
    user?.fullName ||
    user?.name ||
    user?.username ||
    "Account";

  const initials =
    displayName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target)
      ) {
        setUserOpen(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setUserOpen(false);
        setMobileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  async function handleLogout() {
    try {
      await api.post(
        "/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error(
        "Failed to invalidate the server session:",
        error
      );
    } finally {
      dispatch(logout());

      setUserOpen(false);
      setMobileOpen(false);

      navigate("/login");
    }
  }

  const linkClass = ({ isActive }) => {
    if (isDark) {
      return `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
        isActive
          ? "bg-white/10 text-white"
          : "text-white/55 hover:bg-white/5 hover:text-white"
      }`;
    }

    return `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
      isActive
        ? "bg-slate-100 text-slate-900"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;
  };

  const headerClass = isDark
    ? "border-white/10 bg-[#0C1117]/90"
    : "border-slate-200 bg-white/85";

  const avatarButtonClass = isDark
    ? "border-white/10 hover:bg-white/5"
    : "border-slate-200 hover:bg-slate-50";

  const avatarClass = isDark
    ? "bg-[#1F8A70] text-white"
    : "bg-slate-900 text-white";

  const displayNameClass = isDark
    ? "text-white/75"
    : "text-slate-700";

  const menuClass = isDark
    ? "border-white/10 bg-[#131A22]"
    : "border-slate-200 bg-white";

  const emailClass = isDark
    ? "border-white/10 text-white/40"
    : "border-slate-100 text-slate-500";

  const menuItemClass = isDark
    ? "text-white/70 hover:bg-white/5 hover:text-white"
    : "text-slate-700 hover:bg-slate-50";

  const mobilePanelClass = isDark
    ? "border-white/10 bg-[#0C1117]"
    : "border-slate-200 bg-white";

  const mobileLogoutClass = isDark
    ? "border-white/10 text-red-400 hover:bg-red-500/10"
    : "border-slate-200 text-red-600 hover:bg-red-50";

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur transition-colors duration-200 ${headerClass}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        {/* LOGO */}
        <Logo isDark={isDark} />

        {/* DESKTOP NAVIGATION */}
        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClass}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* DESKTOP SHORTENER */}
        <ShortenForm
          isDark={isDark}
          className="ml-auto hidden w-full max-w-md lg:block"
        />

        {/* DESKTOP USER MENU */}
        <div
          ref={userMenuRef}
          className="relative hidden lg:block"
        >
          <button
            type="button"
            onClick={() => setUserOpen((value) => !value)}
            aria-haspopup="menu"
            aria-expanded={userOpen}
            className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 transition ${avatarButtonClass}`}
          >
            <span
              className={`grid h-7 w-7 place-items-center overflow-hidden rounded-full text-xs font-semibold ${avatarClass}`}
            >
              {user?.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  alt=""
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                initials
              )}
            </span>

            <span
              className={`max-w-24 truncate text-sm font-medium ${displayNameClass}`}
            >
              {displayName}
            </span>
          </button>

          {userOpen && (
            <div
              role="menu"
              className={`absolute right-0 mt-2 w-56 rounded-xl border p-1.5 shadow-xl ${menuClass}`}
            >
              {user?.email && (
                <p
                  className={`truncate border-b px-2.5 pb-2 pt-1.5 text-xs ${emailClass}`}
                >
                  {user.email}
                </p>
              )}

              <Link
                to="/settings"
                role="menuitem"
                onClick={() => setUserOpen(false)}
                className={`mt-1 flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition ${menuItemClass}`}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>

              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition ${
                  isDark
                    ? "text-red-400 hover:bg-red-500/10"
                    : "text-red-600 hover:bg-red-50"
                }`}
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          aria-label={
            mobileOpen ? "Close menu" : "Open menu"
          }
          aria-expanded={mobileOpen}
          className={`ml-auto rounded-lg p-2 transition lg:hidden ${
            isDark
              ? "text-white/70 hover:bg-white/5"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* MOBILE PANEL */}
      {mobileOpen && (
        <div
          className={`border-t px-4 pb-4 pt-3 transition-colors lg:hidden ${mobilePanelClass}`}
        >
          {/* MOBILE SHORTENER */}
          <ShortenForm isDark={isDark} />

          {/* MOBILE NAVIGATION */}
          <nav
            className="mt-4 flex flex-col gap-1"
            aria-label="Mobile navigation"
          >
            {NAV_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkClass}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}

            <NavLink
              to="/settings"
              className={linkClass}
              onClick={() => setMobileOpen(false)}
            >
              Settings
            </NavLink>
          </nav>

          {/* MOBILE LOGOUT */}
          <button
            type="button"
            onClick={handleLogout}
            className={`mt-3 flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${mobileLogoutClass}`}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
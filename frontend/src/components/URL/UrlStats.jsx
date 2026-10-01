import { Link2 } from "lucide-react";
import Loader from "../Loader/Loader.jsx";

const CreateUrl = ({
  longUrl,
  setLongUrl,
  onSubmit,
  isCreating,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        Make a long link short
      </h1>

      <p className="mt-1.5 max-w-xl text-sm text-slate-600">
        Paste any http or https link. You get a short link you can
        share and track.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-6 flex flex-col gap-3 sm:flex-row"
      >
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 transition focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20">
          <Link2
            className="h-4 w-4 shrink-0 text-slate-400"
            aria-hidden="true"
          />

          <input
            type="url"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="https://example.com/a-very-long-page-address"
            aria-label="Long URL"
            className="w-full bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>

        <button
          type="submit"
          disabled={isCreating || !longUrl.trim()}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          {isCreating && (
            <Loader
              loading={true}
              size="sm"
              className="text-white"
            />
          )}

          {isCreating ? "Shortening..." : "Shorten link"}
        </button>
      </form>
    </section>
  );
};

export default CreateUrl;
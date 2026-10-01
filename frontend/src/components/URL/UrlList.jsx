import { Search } from "lucide-react";
import UrlRow from "./UrlRow.jsx";

const UrlList = ({
  urls,
  totalUrls,
  search,
  setSearch,
  onDetails,
  onEdit,
  onDelete,
}) => {
  const gridCols =
    "md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)_70px_90px_112px]";

  return (
    <section className="mt-8">


      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Your links
        </h2>

        <div className="flex w-full items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 transition focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20 sm:w-72">
          <Search
            className="h-4 w-4 text-slate-400"
            aria-hidden="true"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by link or code"
            aria-label="Search links"
            className="ui-input w-full bg-transparent py-2 text-sm outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="ui-card overflow-hidden rounded-2xl border border-slate-200 bg-white">


        <div
          className={`hidden gap-4 border-b border-slate-200 bg-slate-50 px-5 py-2.5 text-xs font-medium text-slate-500 md:grid ${gridCols}`}
        >
          <span>Short link</span>
          <span>Original URL</span>
          <span>Clicks</span>
          <span>Status</span>

          <span className="text-right">
            Actions
          </span>
        </div>


        {urls.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="font-medium text-slate-900">
              {totalUrls === 0
                ? "No links yet"
                : "No links match your search"}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {totalUrls === 0
                ? "Paste a URL above to create your first short link."
                : "Try a different word or clear the search."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {urls.map((url) => (
              <UrlRow
                key={url._id}
                url={url}
                gridCols={gridCols}
                onDetails={onDetails}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </ul>
        )}

      </div>
    </section>
  );
};

export default UrlList;
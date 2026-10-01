import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import CopyButton from "./CopyButton.jsx";
import StatusBadge from "./StatusBadge.jsx";
import { shortUrlFor } from "../../utils/shortUrl.js";

const formatDate = (iso) => {
  if (!iso) return "-";

  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const UrlRow = ({
  url,
  gridCols,
  onDetails,
  onEdit,
  onDelete,
}) => {
  const shortUrl = shortUrlFor(url.shortCode);

  return (
    <li
      className={`grid gap-3 px-5 py-4 md:items-center md:gap-4 ${gridCols}`}
    >
      
      <div className="flex min-w-0 items-center gap-1">
        <a
          href={shortUrl}
          target="_blank"
          rel="noreferrer"
          className="truncate text-sm font-medium text-blue-700 hover:underline"
        >
          {shortUrl}
        </a>

        <CopyButton text={shortUrl} />
      </div>

      {/* ORIGINAL URL */}
      <p
        className="truncate text-sm text-slate-600"
        title={url.originalUrl}
      >
        {url.originalUrl}
      </p>

      {/* CLICKS */}
      <p className="text-sm font-medium text-slate-900">
        {url.clicks || 0}

        <span className="ml-1 text-slate-500 md:hidden">
          clicks
        </span>
      </p>

      {/* STATUS */}
      <div className="flex items-center gap-3 md:block">
        <StatusBadge active={url.isActive} />

        <span className="text-xs text-slate-400 md:hidden">
          {formatDate(url.createdAt)}
        </span>
      </div>

      {/* ACTIONS */}
      <div className="flex items-center gap-1 md:justify-end">

        {/* DETAILS */}
        <button
          type="button"
          onClick={() => onDetails(url)}
          aria-label="View details"
          className="ui-icon-button grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          <Eye className="h-4 w-4" />
        </button>

        {/* EDIT */}
        <button
          type="button"
          onClick={() => onEdit(url)}
          aria-label="Edit destination"
          className="ui-icon-button grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          <Pencil className="h-4 w-4" />
        </button>

        {/* DELETE */}
        <button
          type="button"
          onClick={() => onDelete(url)}
          aria-label="Delete link"
          className="ui-icon-button grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>

      </div>
    </li>
  );
};

export default UrlRow;
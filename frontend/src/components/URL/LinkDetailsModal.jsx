import {
  ExternalLink,
} from "lucide-react";

import Modal from "./Modal.jsx";
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

const DetailRow = ({
  label,
  children,
}) => {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
      <dt className="text-sm text-slate-500">
        {label}
      </dt>

      <dd className="min-w-0 break-all text-right text-sm font-medium text-slate-900">
        {children}
      </dd>
    </div>
  );
};

const LinkDetailsModal = ({
  url,
  onClose,
}) => {
  const shortUrl = shortUrlFor(url.shortCode);

  return (
    <Modal
      title="Link details"
      onClose={onClose}
    >
      <dl>

        <DetailRow label="Short link">
          {shortUrl}
        </DetailRow>

        <DetailRow label="Destination">
          <a
            href={url.originalUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-blue-700 hover:underline"
          >
            {url.originalUrl}

            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          </a>
        </DetailRow>

        <DetailRow label="Clicks">
          {url.clicks || 0}
        </DetailRow>

        <DetailRow label="Status">
          <StatusBadge active={url.isActive} />
        </DetailRow>

        <DetailRow label="Created">
          {formatDate(url.createdAt)}
        </DetailRow>

      </dl>
    </Modal>
  );
};

export default LinkDetailsModal;
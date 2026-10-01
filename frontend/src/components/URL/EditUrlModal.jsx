import Modal from "./Modal.jsx";
import Loader from "../Loader/Loader.jsx";
import { shortUrlFor } from "../../utils/shortUrl.js";
import ErrorMessage from "../Error/Error.jsx";

const EditUrlModal = ({
  url,
  editValue,
  setEditValue,
  onClose,
  onSubmit,
  isUpdating,
  error,
}) => {
  const shortUrl = shortUrlFor(url.shortCode);

  return (
    <Modal
      title="Edit destination"
      onClose={onClose}
    >
      <form onSubmit={onSubmit}>
        <ErrorMessage message={error} />

        <p className="mb-3 text-sm text-slate-600">
          The short link{" "}

          <span className="font-medium text-slate-900">
            {shortUrl}
          </span>{" "}

          stays the same. Only where it points changes.
        </p>

        <label
          htmlFor="edit-url"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          New destination URL
        </label>

        <input
          id="edit-url"
          type="url"
          value={editValue}
          onChange={(e) =>
            setEditValue(e.target.value)
          }
          className="ui-input w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
        />

        <div className="mt-5 flex justify-end gap-2">

          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="ui-button-secondary rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              isUpdating ||
              !editValue?.trim()
            }
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400"
          >
            {isUpdating && (
              <Loader
                loading={true}
                size="sm"
                className="text-white"
              />
            )}

            {isUpdating
              ? "Saving..."
              : "Save changes"}
          </button>

        </div>
      </form>
    </Modal>
  );
};

export default EditUrlModal;
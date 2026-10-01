import Modal from "./Modal.jsx";
import Loader from "../Loader/Loader.jsx";
import { shortUrlFor } from "../../utils/shortUrl.js";
import ErrorMessage from "../Error/Error.jsx";

const DeleteUrlModal = ({
  url,
  onClose,
  onDelete,
  isDeleting,
  error,
}) => {
  const shortUrl = shortUrlFor(url.shortCode);

  return (
    <Modal
      title="Delete this link?"
      onClose={onClose}
    >
      <ErrorMessage message={error} />
      <p className="text-sm text-slate-600">

        <span className="font-medium text-slate-900">
          {shortUrl}
        </span>{" "}

        will stop working for everyone who has it.
        This can't be undone.

      </p>

      <div className="mt-5 flex justify-end gap-2">

        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="ui-button-secondary rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Keep link
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="ui-button-danger flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting && (
            <Loader
              loading={true}
              size="sm"
              className="text-white"
            />
          )}

          {isDeleting
            ? "Deleting..."
            : "Delete link"}
        </button>

      </div>
    </Modal>
  );
};

export default DeleteUrlModal;
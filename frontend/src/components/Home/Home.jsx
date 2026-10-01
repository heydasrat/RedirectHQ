import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  CreateUrl,
  DeleteUrlModal,
  EditUrlModal,
  LinkDetailsModal,
  UrlList,
} from "../URL";

import Navbar from "../Header/Navbar.jsx";
import Loader from "../Loader/Loader.jsx";
import ErrorMessage from "../Error/Error.jsx";

import {
  setUrlLoading,
  setUrlError,
  clearUrls,
  setUrls,
} from "../../app/features/urlSlice.js";

import api from "../Axios/Axios.js";

const HomeCMP = () => {
  const dispatch = useDispatch();

  const { isUrlLoading, urlArr, urlError } = useSelector(
    (state) => state.url
  );

  const { user } = useSelector((state) => state.auth);

  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  /* OLD IMPLEMENTATION - KEPT FOR REFERENCE:
  const [pageError, setPageError] = useState("");
  */

  // --------------------------------------------------
  // THEME
  // --------------------------------------------------

  const theme = user?.preferences?.theme || "light";
  const isDark = theme === "dark";

  // --------------------------------------------------
  // THEME CLASSES
  // --------------------------------------------------

  const pageClass = isDark
    ? "bg-[#0C1117] text-white"
    : "bg-slate-50 text-slate-900";

  const cardClass = isDark
    ? "border-white/10 bg-[#131A22]"
    : "border-slate-200 bg-white";

  const headingClass = isDark
    ? "text-white"
    : "text-slate-900";

  const mutedClass = isDark
    ? "text-white/50"
    : "text-slate-600";

  const statNumberClass = isDark
    ? "text-white"
    : "text-slate-900";

  const statLabelClass = isDark
    ? "text-white/45"
    : "text-slate-500";

  const dividerClass = isDark
    ? "divide-white/10"
    : "divide-slate-200";

  // --------------------------------------------------
  // MODAL
  // --------------------------------------------------

  const closeModal = useCallback(() => {
    setModal(null);
    setEditValue("");
  }, []);

  // --------------------------------------------------
  // FETCH URLS
  // --------------------------------------------------

  const fetchURLs = useCallback(async () => {
    dispatch(setUrlError(""));
    dispatch(setUrlLoading(true));

    try {
      const response = await api.get("/url/my");

      if (response.data?.success) {
        dispatch(
          setUrls(response.data.data || [])
        );
      } else {
        dispatch(setUrls([]));
      }
    } catch (error) {
      console.error("Failed to fetch URLs:", error);
      dispatch(setUrlError(error.response?.data?.message || "Unable to load your links."));
      dispatch(clearUrls());
    } finally {
      dispatch(setUrlLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchURLs();
  }, [fetchURLs]);

  // --------------------------------------------------
  // CREATE URL
  // --------------------------------------------------

  const handleCreate = async (e, urlValue) => {
    e.preventDefault();

    const trimmedUrl = urlValue.trim();

    if (!trimmedUrl) return;

    dispatch(setUrlError(""));
    setIsCreating(true);

    try {
      const response = await api.post("/url", {
        originalUrl: trimmedUrl,
      });

      if (response.data?.success) {
        await fetchURLs();
        return true;
      }
    } catch (error) {
      console.error(
        "Failed to create short URL:",
        error
      );

      const message =
        error.response?.data?.message ||
        "Failed to create short link.";

      /* OLD IMPLEMENTATION - KEPT FOR REFERENCE: alert(message) */
      dispatch(setUrlError(message));
    } finally {
      setIsCreating(false);
    }

    return false;
  };

  // --------------------------------------------------
  // DETAILS
  // --------------------------------------------------

  const openDetails = (url) => {
    setModal({
      type: "details",
      url,
    });
  };

  // --------------------------------------------------
  // EDIT
  // --------------------------------------------------

  const openEdit = (url) => {
    setEditValue(url.originalUrl);

    setModal({
      type: "edit",
      url,
    });
  };

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  const openDelete = (url) => {
    setModal({
      type: "delete",
      url,
    });
  };

  // --------------------------------------------------
  // UPDATE URL
  // --------------------------------------------------

  const handleUpdate = async (e) => {
    e.preventDefault();

    const trimmedUrl = editValue.trim();

    if (
      !trimmedUrl ||
      !modal?.url?.shortCode
    ) {
      return;
    }

    setIsUpdating(true);
    dispatch(setUrlError(""));

    try {
      const shortCode = modal.url.shortCode;

      const response = await api.patch(
        `/url/${shortCode}`,
        {
          originalUrl: trimmedUrl,
        }
      );

      if (response.data?.success) {
        closeModal();
        await fetchURLs();
      }
    } catch (error) {
      console.error(
        "Failed to update URL:",
        error
      );

      const message =
        error.response?.data?.message ||
        "Failed to update the destination URL.";

      /* OLD IMPLEMENTATION - KEPT FOR REFERENCE: alert(message) */
      dispatch(setUrlError(message));
    } finally {
      setIsUpdating(false);
    }
  };

  // --------------------------------------------------
  // DELETE URL
  // --------------------------------------------------

  const handleDelete = async () => {
    if (!modal?.url?.shortCode) return;

    setIsDeleting(true);
    dispatch(setUrlError(""));

    try {
      const shortCode = modal.url.shortCode;

      const response = await api.delete(
        `/url/${shortCode}`
      );

      if (response.data?.success) {
        closeModal();
        await fetchURLs();
      }
    } catch (error) {
      console.error(
        "Failed to delete URL:",
        error
      );

      const message =
        error.response?.data?.message ||
        "Failed to delete the short link.";

      /* OLD IMPLEMENTATION - KEPT FOR REFERENCE: alert(message) */
      dispatch(setUrlError(message));
    } finally {
      setIsDeleting(false);
    }
  };

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const filtered = urlArr.filter((url) => {
    const q = search.trim().toLowerCase();

    if (!q) return true;

    return (
      url.originalUrl
        ?.toLowerCase()
        .includes(q) ||
      url.shortCode
        ?.toLowerCase()
        .includes(q)
    );
  });

  // --------------------------------------------------
  // STATS
  // --------------------------------------------------

  const totalClicks = urlArr.reduce(
    (sum, url) => sum + (url.clicks || 0),
    0
  );

  const activeCount = urlArr.filter(
    (url) => url.isActive
  ).length;

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${pageClass}`}
    >
      <Navbar />

      <Loader
        loading={isUrlLoading}
        fullScreen
        label="Loading your links..."
      />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <ErrorMessage message={urlError} />

        {/* CREATE URL */}
        <section
          className={`ui-card rounded-2xl border p-6 transition-colors duration-200 sm:p-8 ${cardClass}`}
        >
          <h1
            className={`text-2xl font-semibold tracking-tight sm:text-3xl ${headingClass}`}
          >
            Make a long link short
          </h1>

          <p
            className={`mt-1.5 max-w-xl text-sm ${mutedClass}`}
          >
            Paste any http or https link. You get a
            short link you can share and track.
          </p>

          <CreateUrl
            onSubmit={handleCreate}
            isCreating={isCreating}
          />
        </section>

        {/* STATS */}
        <section
          className={`ui-card mt-6 grid grid-cols-3 divide-x rounded-2xl border transition-colors duration-200 ${dividerClass} ${cardClass}`}
        >
          {/* TOTAL LINKS */}
          <div className="px-4 py-4 sm:px-6">
            <p
              className={`text-2xl font-semibold ${statNumberClass}`}
            >
              {urlArr.length}
            </p>

            <p
              className={`text-xs sm:text-sm ${statLabelClass}`}
            >
              Links created
            </p>
          </div>

          {/* TOTAL CLICKS */}
          <div className="px-4 py-4 sm:px-6">
            <p
              className={`text-2xl font-semibold ${statNumberClass}`}
            >
              {totalClicks}
            </p>

            <p
              className={`text-xs sm:text-sm ${statLabelClass}`}
            >
              Total clicks
            </p>
          </div>

          {/* ACTIVE LINKS */}
          <div className="px-4 py-4 sm:px-6">
            <p
              className={`text-2xl font-semibold ${statNumberClass}`}
            >
              {activeCount}
            </p>

            <p
              className={`text-xs sm:text-sm ${statLabelClass}`}
            >
              Active links
            </p>
          </div>
        </section>

        {/* URL LIST */}
        <section className="mt-8">
          <UrlList
            urls={filtered}
            totalUrls={urlArr.length}
            search={search}
            onDetails={openDetails}
            onEdit={openEdit}
            onDelete={openDelete}
            setSearch={setSearch}
          />
        </section>
      </main>

      {/* DETAILS MODAL */}
      {modal?.type === "details" && (
        <LinkDetailsModal
          url={modal.url}
          onClose={closeModal}
        />
      )}

      {/* EDIT MODAL */}
      {modal?.type === "edit" && (
        <EditUrlModal
          url={modal.url}
          error={urlError}
          editValue={editValue}
          setEditValue={setEditValue}
          onSubmit={handleUpdate}
          onClose={closeModal}
          isUpdating={isUpdating}
        />
      )}

      {/* DELETE MODAL */}
      {modal?.type === "delete" && (
        <DeleteUrlModal
          url={modal.url}
          error={urlError}
          onDelete={handleDelete}
          onClose={closeModal}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default HomeCMP;
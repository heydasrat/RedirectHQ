import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import UrlList from "../URL/UrlList.jsx";
import LinkDetailsModal from "../URL/LinkDetailsModal.jsx";
import EditUrlModal from "../URL/EditUrlModal.jsx";
import DeleteUrlModal from "../URL/DeleteUrlModal.jsx";
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

const LinksCMP = () => {
  const dispatch = useDispatch();

  const { urlArr, isUrlLoading, urlError } = useSelector((state) => state.url);

  const [search, setSearch] = useState("");

  const [modal, setModal] = useState(null);
  const [editValue, setEditValue] = useState("");

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  /* OLD IMPLEMENTATION - KEPT FOR REFERENCE:
  const [pageError, setPageError] = useState("");
  */

  

  const closeModal = useCallback(() => {
    setModal(null);
    setEditValue("");
  }, []);

  

  const fetchURLs = useCallback(async () => {
    dispatch(setUrlError(""));
    dispatch(setUrlLoading(true));

    try {
      const response = await api.get("/url/my");

      if (response.data?.success) {
        dispatch(setUrls(response.data.data || []));
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

  

  const filtered = urlArr.filter((url) => {
    const q = search.trim().toLowerCase();

    if (!q) return true;

    return (
      url.originalUrl?.toLowerCase().includes(q) ||
      url.shortCode?.toLowerCase().includes(q)
    );
  });

  

  const openDetails = (url) => {
    setModal({
      type: "details",
      url,
    });
  };

  

  const openEdit = (url) => {
    setEditValue(url.originalUrl);

    setModal({
      type: "edit",
      url,
    });
  };

  

  const openDelete = (url) => {
    setModal({
      type: "delete",
      url,
    });
  };

 

  const handleUpdate = async (e) => {
    e.preventDefault();

    const trimmedUrl = editValue.trim();

    if (!trimmedUrl || !modal?.url?.shortCode) {
      return;
    }

    setIsUpdating(true);
    dispatch(setUrlError(""));

    try {
      const shortCode = modal.url.shortCode;

      const response = await api.patch(`/url/${shortCode}`, {
        originalUrl: trimmedUrl,
      });

      if (response.data?.success) {
        closeModal();
        await fetchURLs();
      }
    } catch (error) {
      console.error("Failed to update URL:", error);

      const message =
        error.response?.data?.message ||
        "Failed to update the destination URL.";

      /* OLD IMPLEMENTATION - KEPT FOR REFERENCE: alert(message) */
      dispatch(setUrlError(message));
    } finally {
      setIsUpdating(false);
    }
  };

 

  const handleDelete = async () => {
    if (!modal?.url?.shortCode) {
      return;
    }

    setIsDeleting(true);
    dispatch(setUrlError(""));

    try {
      const shortCode = modal.url.shortCode;

      const response = await api.delete(`/url/${shortCode}`);

      if (response.data?.success) {
        closeModal();
        await fetchURLs();
      }
    } catch (error) {
      console.error("Failed to delete URL:", error);

      const message =
        error.response?.data?.message ||
        "Failed to delete the short link.";

      /* OLD IMPLEMENTATION - KEPT FOR REFERENCE: alert(message) */
      dispatch(setUrlError(message));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
    <Navbar/>
      <Loader loading={isUrlLoading} fullScreen label="Loading your links..." />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <ErrorMessage message={urlError} />
        <UrlList
          urls={filtered}
          totalUrls={urlArr.length}
          search={search}
          setSearch={setSearch}
          onDetails={openDetails}
          onEdit={openEdit}
          onDelete={openDelete}
        />
      </main>

      {/* Details Modal */}

      {modal?.type === "details" && (
        <LinkDetailsModal
          url={modal.url}
          onClose={closeModal}
        />
      )}

      {/* Edit Modal */}

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

      {/* Delete Modal */}

      {modal?.type === "delete" && (
        <DeleteUrlModal
          url={modal.url}
          error={urlError}
          onDelete={handleDelete}
          onClose={closeModal}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
};

export default LinksCMP;
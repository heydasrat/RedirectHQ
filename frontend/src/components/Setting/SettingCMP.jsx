import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Camera,
  Save,
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Loader2,
  Trash,
  Sun,
  Moon
} from "lucide-react"
import Navbar from "../Header/Navbar.jsx"
import api from "../Axios/Axios.js"
import { useSelector, useDispatch } from "react-redux"
import { login, logout } from "../../app/features/authSlice.js"


const SettingCMP = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const [username, setUsername] = useState(user?.username || "")
  const [fullName, setFullName] = useState(user?.fullName || "")
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const navigate = useNavigate()

  const [profileError, setProfileError] = useState("")
  const [profileSuccess, setProfileSuccess] = useState("")
  const [profileLoading, setProfileLoading] = useState(false)

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)

  const [startDeletingAvatar, setStartDeletingAvatar] = useState(false)

  const [theme, setTheme] = useState(
    user?.preferences?.theme || "light"
  )
  const [themeError, setThemeError] = useState("")

  const isDark = theme === "dark"

  /* ---------- theme tokens (same palette as the login page) ---------- */

  const pageClass = isDark
    ? "bg-[#0C1117] text-white"
    : "bg-[#EDEFF2] text-[#131A22]"

  const cardClass = isDark
    ? "bg-[#131A22] border-white/10"
    : "bg-white border-[#E2E5E9] shadow-[0_1px_2px_rgba(19,26,34,0.04),0_12px_32px_-12px_rgba(19,26,34,0.14)]"

  const headingClass = isDark ? "text-white" : "text-[#131A22]"

  const mutedClass = isDark ? "text-white/45" : "text-[#6B7480]"

  const labelClass = isDark ? "text-white/70" : "text-[#3D4753]"

  const borderClass = isDark ? "border-white/10" : "border-[#EDEFF2]"

  const inputClass =
    "ui-input w-full rounded-[10px] border px-3.5 py-3 text-[14.5px] outline-none " +
    "transition-[border-color,box-shadow] duration-150 " +
    "focus:border-[#1F8A70] focus:shadow-[0_0_0_3.5px_rgba(31,138,112,0.14)] " +
    (isDark
      ? "bg-white/[0.04] border-white/10 text-white placeholder:text-white/30"
      : "bg-white border-[#DCE0E5] text-[#131A22] placeholder:text-[#9AA3AD]")

  const primaryButtonClass =
    "ui-button-primary inline-flex items-center justify-center gap-2 rounded-[10px] px-5 py-3 text-[14.5px] font-medium text-white " +
    "shadow-[0_1px_2px_rgba(19,26,34,0.25)] transition-colors duration-150 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F8A70] focus-visible:ring-offset-2 " +
    "disabled:cursor-not-allowed disabled:opacity-55 " +
    (isDark
      ? "bg-[#1F8A70] hover:bg-[#23997d] focus-visible:ring-offset-[#131A22]"
      /* OLD IMPLEMENTATION - KEPT FOR REFERENCE: bg-[#131A22] hover:bg-[#1F2A38] active:bg-[#0D1621] */
      : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus-visible:ring-offset-white")

  const secondaryButtonClass =
    "ui-button-secondary inline-flex items-center gap-2 rounded-[10px] border px-3.5 py-2.5 text-[13.5px] font-medium transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F8A70]/40 " +
    "disabled:cursor-not-allowed disabled:opacity-50 " +
    (isDark
      ? "border-white/10 text-white/70 hover:bg-white/5"
      : "border-[#DCE0E5] bg-white text-[#3D4753] hover:bg-[#F6F7F9]")

  const errorAlertClass = isDark
    ? "border-red-500/20 bg-red-500/10 text-red-400"
    : "border-[#FECDCA] bg-[#FEF3F2] text-[#B42318]"

  const successAlertClass = isDark
    ? "border-[#1F8A70]/25 bg-[#1F8A70]/10 text-[#4CC2A2]"
    : "border-[#BFE3D7] bg-[#ECF7F3] text-[#146B55]"

  const eyeButtonClass = `absolute inset-y-0 right-1.5 my-auto flex h-9 w-9 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F8A70]/40 ${isDark
    ? "text-white/35 hover:text-white/80"
    : "text-[#9AA3AD] hover:text-[#3D4753]"
    }`

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview])

  const handleChangeTheme = async (newTheme) => {
    if (newTheme === theme) return

    const previousTheme = theme
    const previousUser = user

    setTheme(newTheme)
    setThemeError("")
    dispatch(login({
      ...user,
      preferences: { ...user?.preferences, theme: newTheme },
    }))

    try {
      const response = await api.patch(
        "/user/toggle-theme",
        { theme: newTheme },
        { withCredentials: true }
      )

      if (response.data.success) {
        dispatch(login(response.data.data))
      } else {
        setTheme(previousTheme)
        if (previousUser) dispatch(login(previousUser))
        setThemeError(
          response.data.message || "Failed to change theme."
        )
      }
    } catch (error) {
      setTheme(previousTheme)
      if (previousUser) dispatch(login(previousUser))
      setThemeError(
        error.response?.data?.message ||
        "Unable to change theme. Please try again."
      )
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (file.size > 4 * 1024 * 1024) {
      setProfileError("Profile photo must be 4 MB or smaller.")
      e.target.value = ""
      return
    }

    const isJpeg =
      file.type === "image/jpeg" ||
      file.name.toLowerCase().endsWith(".jpg") ||
      file.name.toLowerCase().endsWith(".jpeg")

    if (!isJpeg) {
      setProfileError(
        "Only JPEG images are accepted (.jpg or .jpeg)."
      )
      e.target.value = ""
      return
    }

    setAvatarFile(file)

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview)
    }

    setAvatarPreview(URL.createObjectURL(file))
    setProfileError("")
  }

  const handleRemoveAvatar = () => {
    setAvatarFile(null)

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview)
    }

    setAvatarPreview(null)

    const fileInput = document.getElementById("avatarFileInput")

    if (fileInput) {
      fileInput.value = ""
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()

    setProfileError("")
    setProfileSuccess("")

    if (!username.trim()) {
      setProfileError("Username cannot be empty.")
      return
    }

    if (!fullName.trim()) {
      setProfileError("Full name cannot be empty.")
      return
    }

    setProfileLoading(true)

    try {
      const formData = new FormData()

      formData.append("username", username.trim())
      formData.append("fullName", fullName.trim())

      if (avatarFile) {
        formData.append("avatar", avatarFile)
      }

      const response = await api.patch(
        "/user/update-profile",
        formData,
        { withCredentials: true }
      )

      if (response.data?.success) {
        dispatch(login(response.data.data))

        setProfileSuccess("Profile updated successfully.")
        setAvatarFile(null)

        if (avatarPreview) {
          URL.revokeObjectURL(avatarPreview)
        }

        setAvatarPreview(null)

        const fileInput = document.getElementById("avatarFileInput")

        if (fileInput) {
          fileInput.value = ""
        }

        setTimeout(() => {
          setProfileSuccess("")
        }, 4000)
      } else {
        setProfileError(
          response.data?.message || "Failed to update profile."
        )
      }
    } catch (error) {
      console.error("Update profile error:", error)

      setProfileError(
        error.response?.data?.message ||
        "Failed to update profile."
      )
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    setPasswordError("")
    setPasswordSuccess("")

    if (!oldPassword) {
      setPasswordError("Please enter your current password.")
      return
    }

    if (!newPassword) {
      setPasswordError("Please enter a new password.")
      return
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "Password must be at least 8 characters long."
      )
      return
    }

    setPasswordLoading(true)

    try {
      const response = await api.patch(
        "/user/change-password",
        {
          oldPassword,
          newPassword
        },
        { withCredentials: true }
      )

      if (response.data?.success) {
        setPasswordSuccess(
          response.data?.message ||
          "Password changed successfully."
        )

        setOldPassword("")
        setNewPassword("")
        setShowOldPassword(false)
        setShowNewPassword(false)
        dispatch(logout())
        navigate("/login", { replace: true })

        setTimeout(() => {
          setPasswordSuccess("")
        }, 4000)
      } else {
        setPasswordError(
          response.data?.message ||
          "Failed to change password."
        )
      }
    } catch (error) {
      setPasswordError(
        error.response?.data?.message ||
        "Failed to change password."
      )
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteAvatar = async (e) => {
    e.preventDefault()

    try {
      setStartDeletingAvatar(true)

      const response = await api.patch(
        "/user/delete-avatar",
        {},
        { withCredentials: true }
      )

      if (response.data.success) {
        dispatch(login(response.data.data))
        setProfileSuccess("Profile photo removed.")
      }
    } catch (error) {
      setProfileError(error.response?.data?.message || "Failed to remove profile photo.")
    } finally {
      setStartDeletingAvatar(false)
    }
  }

  const initials =
    fullName
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => name[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "U"

  return (
    <>
      <Navbar />

      <div
        className={`tk-root min-h-screen w-full antialiased transition-colors duration-200 ${pageClass}`}
      >
        {/* OLD IMPLEMENTATION - KEPT FOR REFERENCE
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap');
          .tk-root{font-family:'Instrument Sans',ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-feature-settings:'ss01','cv01';}
        `}</style>
        */}

        <div className="mx-auto max-w-[900px] px-4 py-8 sm:px-6 sm:py-10">
          <div className="mb-8">
            <h1
              className={`text-[27px] font-semibold tracking-[-0.03em] ${headingClass}`}
            >
              Settings
            </h1>

            <p className={`mt-1.5 text-[14px] ${mutedClass}`}>
              Manage your profile and account security
            </p>
          </div>

          <div className="space-y-6">
            {/* ---------------- Appearance ---------------- */}
            <section
              className={`ui-card rounded-[20px] border p-6 transition-colors sm:p-8 ${cardClass}`}
            >
              <div className={`mb-6 border-b pb-5 ${borderClass}`}>
                <h2
                  className={`text-[17px] font-semibold tracking-[-0.02em] ${headingClass}`}
                >
                  Appearance
                </h2>

                <p className={`mt-1 text-[14px] ${mutedClass}`}>
                  Choose how RedirectHQ looks for you.
                </p>
              </div>

              {themeError && (
                <div
                  className={`ui-alert-error mb-5 flex items-start gap-3 rounded-[10px] border p-3.5 text-[13.5px] ${errorAlertClass}`}
                >
                  <AlertCircle className="mt-0.5 h-[18px] w-[18px] shrink-0" />
                  <span className="font-medium">{themeError}</span>
                </div>
              )}

              <div
                role="radiogroup"
                aria-label="Theme"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                {[
                  {
                    value: "light",
                    title: "Light",
                    description:
                      "Use RedirectHQ with a clean light appearance.",
                    icon: Sun
                  },
                  {
                    value: "dark",
                    title: "Dark",
                    description:
                      "Use RedirectHQ with a comfortable dark appearance.",
                    icon: Moon
                  }
                ].map((item) => {
                  const Icon = item.icon
                  const selected = theme === item.value

                  return (
                    <button
                      key={item.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => handleChangeTheme(item.value)}
                      className={`rounded-[14px] border p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F8A70]/40 ${selected
                        ? "border-[#1F8A70] bg-[#1F8A70]/[0.06]"
                        : isDark
                          ? "border-white/10 bg-white/[0.03] hover:border-white/20"
                          : "border-[#E2E5E9] bg-[#F6F7F9] hover:border-[#C4CAD1]"
                        }`}
                    >
                      <div className="mb-5 flex items-center justify-between">
                        <div
                          className={`grid h-10 w-10 place-items-center rounded-[10px] border ${isDark
                            ? "border-white/10 bg-[#0C1117]"
                            : "border-[#E2E5E9] bg-white"
                            }`}
                        >
                          <Icon
                            className={`h-[18px] w-[18px] ${selected ? "text-[#1F8A70]" : mutedClass
                              }`}
                            strokeWidth={2}
                          />
                        </div>

                        <div
                          className={`h-5 w-5 rounded-full ${selected
                            ? `border-[5px] border-[#1F8A70] ${isDark ? "bg-[#131A22]" : "bg-white"
                            }`
                            : isDark
                              ? "border-2 border-white/25 bg-transparent"
                              : "border-2 border-[#C4CAD1] bg-white"
                            }`}
                        />
                      </div>

                      <h3
                        className={`text-[14px] font-semibold ${headingClass}`}
                      >
                        {item.title}
                      </h3>

                      <p className={`mt-1 text-[13px] ${mutedClass}`}>
                        {item.description}
                      </p>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* ---------------- Profile ---------------- */}
            <section
              className={`ui-card rounded-[20px] border p-6 transition-colors sm:p-8 ${cardClass}`}
            >
              <div className={`mb-6 border-b pb-5 ${borderClass}`}>
                <h2
                  className={`text-[17px] font-semibold tracking-[-0.02em] ${headingClass}`}
                >
                  Profile
                </h2>

                <p className={`mt-1 text-[14px] ${mutedClass}`}>
                  Update your personal information and profile picture.
                </p>
              </div>

              {profileError && (
                <div
                  className={`ui-alert-error mb-6 flex items-start gap-3 rounded-[10px] border p-3.5 text-[13.5px] ${errorAlertClass}`}
                >
                  <AlertCircle className="mt-0.5 h-[18px] w-[18px] shrink-0" />
                  <span className="font-medium">{profileError}</span>
                </div>
              )}

              {profileSuccess && (
                <div
                  className={`ui-alert-success mb-6 flex items-center gap-3 rounded-[10px] border p-3.5 text-[13.5px] ${successAlertClass}`}
                >
                  <Check className="h-[18px] w-[18px] shrink-0" />
                  <span className="font-medium">{profileSuccess}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit}>
                <div className="mb-7">
                  <p
                    className={`mb-2.5 text-[13px] font-medium ${labelClass}`}
                  >
                    Profile photo
                  </p>

                  <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                    <div
                      className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-full ring-2 ${isDark
                        ? "bg-white/10 ring-white/10"
                        : "bg-[#EDEFF2] ring-[#E2E5E9]"
                        }`}
                    >
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Profile preview"
                          className="h-full w-full object-cover"
                        />
                      ) : user?.avatar?.url ? (
                        <img
                          src={user.avatar.url}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span
                          className={`text-xl font-semibold tracking-wider ${isDark ? "text-white/70" : "text-[#3D4753]"
                            }`}
                        >
                          {initials}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <input
                          type="file"
                          id="avatarFileInput"
                          className="peer sr-only"
                          accept="image/jpeg,image/jpg"
                          onChange={handleAvatarChange}
                        />

                        <label
                          htmlFor="avatarFileInput"
                          className={`${secondaryButtonClass} cursor-pointer peer-focus-visible:ring-2 peer-focus-visible:ring-[#1F8A70]/40`}
                        >
                          <Camera className={`h-4 w-4 ${mutedClass}`} />
                          Change photo
                        </label>

                        {user?.avatar?.url && (
                          <button
                            type="button"
                            onClick={handleDeleteAvatar}
                            disabled={startDeletingAvatar}
                            className={secondaryButtonClass}
                          >
                            <Trash className={`h-4 w-4 ${mutedClass}`} />

                            {startDeletingAvatar
                              ? "Removing..."
                              : "Remove photo"}
                          </button>
                        )}

                        {avatarFile && (
                          <button
                            type="button"
                            onClick={handleRemoveAvatar}
                            className={`inline-flex items-center gap-1.5 rounded-[10px] px-3 py-2.5 text-[13.5px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F8A70]/40 ${isDark
                              ? "text-white/45 hover:bg-red-500/10 hover:text-red-400"
                              : "text-[#6B7480] hover:bg-[#FEF3F2] hover:text-[#B42318]"
                              }`}
                          >
                            Cancel selection
                          </button>
                        )}
                      </div>

                      <p className={`text-[12.5px] ${mutedClass}`}>
                        <span
                          className={`font-medium ${isDark ? "text-white/70" : "text-[#3D4753]"
                            }`}
                        >
                          JPEG images only.
                        </span>{" "}
                        Recommended square aspect ratio.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="settings-username"
                      className={`mb-1.5 block text-[13px] font-medium ${labelClass}`}
                    >
                      Username
                    </label>

                    <input
                      id="settings-username"
                      type="text"
                      value={username}
                      autoComplete="username"
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. johndoe"
                      className={inputClass}
                    />

                    <p className={`mt-1.5 text-[12.5px] ${mutedClass}`}>
                      Your username must be unique.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="settings-fullname"
                      className={`mb-1.5 block text-[13px] font-medium ${labelClass}`}
                    >
                      Full name
                    </label>

                    <input
                      id="settings-fullname"
                      type="text"
                      value={fullName}
                      autoComplete="name"
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div
                  className={`flex flex-col items-stretch justify-end gap-4 border-t pt-5 sm:flex-row sm:items-center ${borderClass}`}
                >
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className={primaryButtonClass}
                  >
                    {profileLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>

            {/* ---------------- Change password ---------------- */}
            <section
              className={`ui-card rounded-[20px] border p-6 transition-colors sm:p-8 ${cardClass}`}
            >
              <div className={`mb-6 border-b pb-5 ${borderClass}`}>
                <h2
                  className={`text-[17px] font-semibold tracking-[-0.02em] ${headingClass}`}
                >
                  Change password
                </h2>

                <p className={`mt-1 text-[14px] ${mutedClass}`}>
                  Update your password to keep your account secure.
                </p>
              </div>

              {passwordError && (
                <div
                  className={`ui-alert-error mb-6 flex items-start gap-3 rounded-[10px] border p-3.5 text-[13.5px] ${errorAlertClass}`}
                >
                  <AlertCircle className="mt-0.5 h-[18px] w-[18px] shrink-0" />
                  <span className="font-medium">{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div
                  className={`ui-alert-success mb-6 flex items-center gap-3 rounded-[10px] border p-3.5 text-[13.5px] ${successAlertClass}`}
                >
                  <Check className="h-[18px] w-[18px] shrink-0" />
                  <span className="font-medium">{passwordSuccess}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-6 max-w-md space-y-5">
                  <div>
                    <label
                      htmlFor="settings-old-password"
                      className={`mb-1.5 block text-[13px] font-medium ${labelClass}`}
                    >
                      Current password
                    </label>

                    <div className="relative">
                      <input
                        id="settings-old-password"
                        type={showOldPassword ? "text" : "password"}
                        value={oldPassword}
                        autoComplete="current-password"
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`${inputClass} pr-11`}
                      />

                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        aria-label={
                          showOldPassword ? "Hide password" : "Show password"
                        }
                        className={eyeButtonClass}
                      >
                        {showOldPassword ? (
                          <Eye className="h-[17px] w-[17px]" />
                        ) : (
                          <EyeOff className="h-[17px] w-[17px]" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="settings-new-password"
                      className={`mb-1.5 block text-[13px] font-medium ${labelClass}`}
                    >
                      New password
                    </label>

                    <div className="relative">
                      <input
                        id="settings-new-password"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        autoComplete="new-password"
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className={`${inputClass} pr-11`}
                      />

                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        aria-label={
                          showNewPassword ? "Hide password" : "Show password"
                        }
                        className={eyeButtonClass}
                      >
                        {showNewPassword ? (
                          <Eye className="h-[17px] w-[17px]" />
                        ) : (
                          <EyeOff className="h-[17px] w-[17px]" />
                        )}
                      </button>
                    </div>

                    <div
                      className={`mt-2 flex items-center gap-1.5 text-[12.5px] ${mutedClass}`}
                    >
                      <Lock className="h-3.5 w-3.5" />

                      <span>
                        Must be at least 8 characters long and include
                        numbers or symbols
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`flex flex-col items-stretch justify-end gap-4 border-t pt-5 sm:flex-row sm:items-center ${borderClass}`}
                >
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className={primaryButtonClass}
                  >
                    {passwordLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Changing password...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        Change password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
            {/* <Footer/> */}
      </div>
    </>
  )
}

export default SettingCMP
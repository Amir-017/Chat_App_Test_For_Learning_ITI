import Swal from "sweetalert2";

// Dark-themed confirm dialog matching the app's slate/emerald look, used in place of window.confirm
// for destructive actions (e.g. clearing a chat). Resolves to true only if the user confirms.
export const confirmDialog = async ({ title, text, confirmText, cancelText }) => {
  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#334155",
    background: "#020617",
    color: "#e2e8f0",
    reverseButtons: true,
    focusCancel: true,
  });

  return result.isConfirmed;
};

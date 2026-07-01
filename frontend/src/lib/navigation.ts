export function redirectToLogin(): void {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

export function redirectToHome(): void {
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}

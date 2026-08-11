/** Set VITE_GITHUB_REPO_URL in client/.env to your repo, e.g. https://github.com/you/wayflow */
export const GITHUB_REPO_URL =
  import.meta.env.VITE_GITHUB_REPO_URL || "https://github.com/your-username/wayflow";

export function githubFileUrl(path: string): string {
  return `${GITHUB_REPO_URL}/blob/main/${path}`;
}

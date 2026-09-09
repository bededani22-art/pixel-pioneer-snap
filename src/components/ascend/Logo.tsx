import light from "@/assets/ascend-light.png.asset.json";
import dark from "@/assets/ascend-dark.png.asset.json";
import { useTheme } from "@/lib/ascend/useTheme";

/**
 * Master brand artwork — never redrawn or recomposed.
 * Light artwork on light backgrounds, dark artwork on dark backgrounds.
 */
export function Logo({ className, forceDark }: { className?: string; forceDark?: boolean }) {
  const { theme } = useTheme();
  const useDarkArtwork = forceDark ?? theme === "dark";
  return (
    <img
      src={useDarkArtwork ? dark.url : light.url}
      alt="ASCEND Consulting Engineers PLC"
      className={className}
    />
  );
}

import type { ReactNode, SVGProps } from "react";
import { Shield, Target, Scale, Bot, Send, Eye, type LucideIcon } from "lucide-react";

const STROKE = 2;

type JjIconProps = SVGProps<SVGSVGElement> & {
  size?: number;
  label?: string;
};

function wrap(Icon: LucideIcon, defaultLabel: string) {
  return function JjLucideIcon({
    size = 22,
    label = defaultLabel,
    className,
    "aria-hidden": ariaHidden,
    ...rest
  }: JjIconProps): ReactNode {
    const hidden = ariaHidden === true || ariaHidden === "true";
    return (
      <Icon
        size={size}
        strokeWidth={STROKE}
        absoluteStrokeWidth
        className={className ? `jj-icon ${className}` : "jj-icon"}
        aria-hidden={hidden ? true : undefined}
        role={hidden ? "presentation" : "img"}
        aria-label={hidden ? undefined : label}
        {...rest}
      />
    );
  };
}

/** Brand iconography: Lucide, 2px stroke, rounded (BRAND_GUIDELINES). */
export const JjIconOnDevice = wrap(Shield, "On-device");
export const JjIconOnTarget = wrap(Target, "On-target");
export const JjIconOnYourTerms = wrap(Scale, "On your terms");
export const JjIconAgent = wrap(Bot, "Agent");
export const JjIconSend = wrap(Send, "Send");
export const JjIconPrivacy = wrap(Eye, "Privacy");

export function JjPrivacyPill(): ReactNode {
  return (
    <span className="jj-privacy-pill">
      <JjIconPrivacy size={14} aria-hidden />
      <span>Agent · On-device</span>
    </span>
  );
}

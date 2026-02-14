import React from "react";
import { iconPaths } from "@/lib/icons";

export type IconName = keyof typeof iconPaths;

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
}

/**
 *
 */
export const Icon: React.FC<IconProps> = ({ name, className, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      {iconPaths[name]}
    </svg>
  );
};

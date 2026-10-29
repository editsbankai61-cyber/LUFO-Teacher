import { Link as TanLink } from "@tanstack/react-router";
import type { MouseEventHandler, ReactNode } from "react";

type Props = {
  href: string;
  className?: string;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  "aria-label"?: string;
  "aria-current"?: "page" | undefined;
  title?: string;
};

export function Link({ href, className, children, onClick, ...rest }: Props) {
  return (
    <TanLink to={href as never} className={className} onClick={onClick} {...rest}>
      {children}
    </TanLink>
  );
}

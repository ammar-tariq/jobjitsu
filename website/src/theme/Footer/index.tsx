/**
 * Soft-swizzle: inject branded footer strip above classic footer.
 * @see https://docusaurus.io/docs/swizzling
 */
import React, { type ReactNode } from "react";
import Footer from "@theme-original/Footer";
import type FooterType from "@theme/Footer";
import type { WrapperProps } from "@docusaurus/types";
import { JjFooterBrand } from "@site/src/components/JjFooterBrand";

type Props = WrapperProps<typeof FooterType>;

export default function FooterWrapper(props: Props): ReactNode {
  return (
    <>
      <JjFooterBrand />
      <Footer {...props} />
    </>
  );
}

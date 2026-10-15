import { Sidebar } from "@/components/layout/sidebar";

export default function PanelLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Sidebar />
      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:pt-8 lg:pr-8 lg:pl-[18.5rem]">{children}</main>
    </>
  );
}

"use client";

import { Arrow } from "@/components/ui/Arrow";
import type { ClientSite } from "@/content/projects";
import { useFloatingPreview } from "./useFloatingPreview";

/** Websites built or maintained for clients, each linking to the live site. */
export function ClientIndex({ clients }: { clients: ClientSite[] }) {
  const previews = clients.flatMap((client) => (client.preview ? [client.preview] : []));
  const floating = useFloatingPreview(previews);

  return (
    <div onPointerLeave={floating.hide}>
      <ol className="border-t border-line">
        {clients.map((client, index) => (
          <li key={client.href} data-reveal className="border-b border-line">
            <a
              href={client.href}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="Visit"
              onPointerEnter={(event) => floating.show(client.preview?.src, event)}
              className="group grid grid-cols-12 items-center gap-x-6 gap-y-1 py-5 md:py-6"
            >
              <span className="t-label col-span-2 text-fg-3 md:col-span-1">{String(index + 1).padStart(2, "0")}</span>
              <span className="col-span-9 md:col-span-4">
                <span className="block text-[1.125rem] font-medium tracking-[-0.024em] transition-[translate] duration-500 ease-out-expo group-hover:translate-x-2 md:text-[1.25rem]">
                  {client.name}
                </span>
                {client.place && <span className="t-small text-fg-3">{client.place}</span>}
              </span>
              <span className="t-small col-span-10 col-start-3 text-fg-2 md:col-span-4 md:col-start-auto">{client.work}</span>
              <span className="t-small col-span-2 hidden text-fg-3 md:block">{client.stack.join(" · ")}</span>
              <span className="col-span-1 row-start-1 flex justify-end md:row-start-auto">
                <span className="grid size-7 place-items-center rounded-full ring-1 ring-line-2 transition-colors group-hover:ring-fg">
                  <Arrow dir="up-right" />
                </span>
              </span>
            </a>
          </li>
        ))}
      </ol>
      {floating.element}
    </div>
  );
}

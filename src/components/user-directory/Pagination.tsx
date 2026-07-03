import { Pagination as ArkPagination } from "@ark-ui/solid/pagination";
import { ChevronLeft, ChevronRight } from "lucide-solid";
import type { Component } from "solid-js";
import { For } from "solid-js";

interface PaginationProps {
  count: number;
  page: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  siblingCount?: number;
  boundaryCount?: number;
}

const triggerClass =
  "inline-flex items-center justify-center rounded border border-border px-2 py-1 text-sm transition-colors hover:bg-muted disabled:opacity-50 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-disabled:opacity-50 data-disabled:hover:bg-transparent";

const itemClass =
  "inline-flex items-center justify-center min-w-9 rounded border border-border px-2 py-1 text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-selected:bg-primary data-selected:text-primary-foreground data-selected:border-primary";

const ellipsisClass =
  "inline-flex items-center justify-center min-w-9 h-9 text-sm text-muted-foreground select-none";

const Pagination: Component<PaginationProps> = (props) => {
  const pageSize = () => props.pageSize ?? 5;
  const start = () => (props.page - 1) * pageSize() + 1;
  const end = () => Math.min(props.page * pageSize(), props.count);

  return (
    <div class="flex items-center justify-between border-t border-border bg-card p-4 text-sm text-muted-foreground">
      {props.count > 0 && (
        <span>
          Showing {start()} to {end()} of {props.count} entries
        </span>
      )}
      {props.count > 0 && (
        <ArkPagination.Root
          count={props.count}
          pageSize={pageSize()}
          page={props.page}
          onPageChange={(details) => props.onPageChange(details.page)}
          siblingCount={props.siblingCount ?? 1}
          boundaryCount={props.boundaryCount ?? 1}
          class="flex items-center gap-1"
        >
          <ArkPagination.PrevTrigger class={triggerClass}>
            <ChevronLeft size={14} />
          </ArkPagination.PrevTrigger>
          <ArkPagination.Context>
            {(api) => (
              <For each={api().pages}>
                {(page, index) =>
                  page.type === "page" ? (
                    <ArkPagination.Item {...page} class={itemClass}>
                      {page.value}
                    </ArkPagination.Item>
                  ) : (
                    <ArkPagination.Ellipsis index={index()} class={ellipsisClass}>
                      &hellip;
                    </ArkPagination.Ellipsis>
                  )
                }
              </For>
            )}
          </ArkPagination.Context>
          <ArkPagination.NextTrigger class={triggerClass}>
            <ChevronRight size={14} />
          </ArkPagination.NextTrigger>
        </ArkPagination.Root>
      )}
    </div>
  );
};

export default Pagination;

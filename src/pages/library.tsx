import { type NextPage } from "next/types";
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  flexRender,
  useReactTable,
} from "@tanstack/react-table";
import { type RouterTypes, trpc } from "~/utils/trpc";
import BookCover from "~/components/BookCover";
import { IoCloseOutline } from "react-icons/io5";
import { useState } from "react";
import dayjs from "dayjs";

type RowType = RouterTypes["books"]["getSavedBooks"]["output"][number];
const columnHelper = createColumnHelper<RowType>();

export function formatDate(date?: Date | null) {
  return date ? dayjs(date).format("DD.MM.YYYY") : "";
}

const shelves = new Map<string, string>([
  ["shelf", "Hyllyssä"],
  ["reading", "Lukemassa"],
  ["read", "Luettu"],
]);

const columns = [
  columnHelper.accessor("book", {
    header: () => <span>Kansi</span>,
    cell: (cell) => <BookCover book={cell.getValue()} size="s" />,
    enableSorting: false,
  }),
  columnHelper.accessor("book.name", {
    header: () => <span>Nimi</span>,
  }),
  columnHelper.accessor("book.authors", {
    header: () => <span>Kirjailija</span>,
  }),
  columnHelper.accessor("bookId", {
    header: () => <span>Arvostelu</span>,
    cell: () => (
      <button type="button" className="btn-sm btn">
        Tähdet...
      </button>
    ),
    enableSorting: false,
  }),
  columnHelper.accessor("shelf", {
    header: () => <span>Hylly</span>,
    cell: (cell) => shelves.get(cell.getValue()),
  }),
  columnHelper.accessor("finishedAt", {
    header: () => <span>Luettu</span>,
    cell: (cell) => formatDate(cell.getValue()),
  }),
  columnHelper.accessor("createdAt", {
    header: () => <span>Lisätty</span>,
    cell: (cell) => formatDate(cell.getValue()),
  }),
  columnHelper.accessor("id", {
    header: () => <span></span>,
    cell: () => (
      <button type="button" className="btn-sm btn-circle btn">
        <IoCloseOutline className="h-5 w-5" />
      </button>
    ),
    enableSorting: false,
  }),
];

const LibraryPage: NextPage = () => {
  const { data } = trpc.books.getSavedBooks.useQuery();

  const [sorting, setSorting] = useState<SortingState>([]);

  const tableData = data ?? ([] as RowType[]);

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder ? null : (
                    <div
                      className={
                        header.column.getCanSort()
                          ? "cursor-pointer select-none"
                          : ""
                      }
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="align-top">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default LibraryPage;

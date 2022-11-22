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
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { Dialog } from "@headlessui/react";
import { type Book } from "@prisma/client";
import Link from "next/link";

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

const LibraryPage: NextPage = () => {
  const trpcContext = trpc.useContext();
  const { data } = trpc.books.getSavedBooks.useQuery();

  const [sorting, setSorting] = useState<SortingState>([]);

  const tableData = data ?? ([] as RowType[]);

  const [targetBook, setTargetBook] = useState<Book | undefined>();
  const [isOpen, setIsOpen] = useState(false);

  const updateSavedBook = trpc.books.updateSavedBook.useMutation();

  const columns = useMemo(
    () => [
      columnHelper.accessor("book", {
        header: () => <span>Kansi</span>,
        cell: (cell) => (
          <Link href={`/books/${cell.row.original.bookId}`}>
            <BookCover book={cell.getValue()} size="s" />
          </Link>
        ),
        enableSorting: false,
      }),
      columnHelper.accessor("book.name", {
        header: () => <span>Nimi</span>,
        cell: (cell) => (
          <Link href={`/books/${cell.row.original.bookId}`}>
            {cell.getValue()}
          </Link>
        ),
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
      columnHelper.accessor("book.id", {
        header: () => <span></span>,
        cell: (cell) => (
          <button
            type="button"
            className="btn-sm btn-circle btn"
            onClick={() => {
              setTargetBook(cell.row.original.book);
              setIsOpen(true);
            }}
          >
            <IoCloseOutline className="h-5 w-5" />
          </button>
        ),
        enableSorting: false,
      }),
    ],
    [],
  );

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
      <Dialog
        as="div"
        className="modal modal-open"
        open={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <Dialog.Panel className="prose modal-box border border-base-content border-opacity-20">
          <Dialog.Title as="h3">Poista kirja</Dialog.Title>
          <p>
            Haluatko varmasti poistaa kirjan {targetBook?.name + " "}
            kirjastostasi? Tätä toimintoa ei voi peruuttaa.
          </p>

          <div className="flex flex-row justify-end gap-4">
            <button
              className="btn-outline btn"
              onClick={async () => {
                await updateSavedBook.mutateAsync(
                  {
                    bookId: targetBook?.id ?? "",
                    shelf: "none",
                  },
                  {
                    onSuccess: () => {
                      trpcContext.books.getSavedBooks.setData(
                        data?.filter((book) => book.bookId !== targetBook?.id),
                      );
                      trpcContext.books.getReadingBooks.invalidate();
                    },
                  },
                );

                setIsOpen(false);
              }}
            >
              Poista
            </button>
            <button className="btn-error btn" onClick={() => setIsOpen(false)}>
              Peruuta
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </>
  );
};

export default LibraryPage;

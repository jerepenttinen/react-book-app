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
import { IoCaretDown, IoCaretUp, IoCloseOutline } from "react-icons/io5";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Dialog } from "@headlessui/react";
import { type Book } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Stars } from "~/components/Stars";

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

function useBookDialog(
  book: Book | undefined = undefined,
): [Book | undefined, (book: Book) => void, boolean, () => void] {
  const [targetBook, setTargetBook] = useState<Book | undefined>(book);

  return [
    targetBook,
    (book: Book) => setTargetBook(book),
    targetBook !== undefined, // isOpen
    () => setTargetBook(undefined), // close
  ];
}

const LibraryPage: NextPage = () => {
  const router = useRouter();
  const { userId } = router.query;
  const session = useSession();

  const [isMyLibrary, setIsMyLibrary] = useState(
    userId === session.data?.user?.id,
  );
  useEffect(() => {
    setIsMyLibrary(userId === session.data?.user?.id);
  }, [session.data?.user?.id, userId]);

  const { data } = trpc.books.getSavedBooks.useQuery(
    {
      userId: userId as string,
    },
    {
      enabled: !!userId,
    },
  );

  const [sorting, setSorting] = useState<SortingState>([]);

  const tableData = data ?? ([] as RowType[]);

  const trpcContext = trpc.useContext();
  const updateSavedBook = trpc.books.updateSavedBook.useMutation();

  const [book, setBook, modalIsOpen, closeModal] = useBookDialog();

  const columns = useMemo(
    () => [
      columnHelper.accessor("book", {
        header: () => <span>Kansi</span>,
        cell: (cell) => <BookCover book={cell.getValue()} size="s" />,
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
      columnHelper.accessor("book.reviews", {
        header: () => <span>Arvostelu</span>,
        cell: (cell) => (
          <button type="button" className="no-animation pb-2">
            <Stars score={cell.getValue().at(0)?.score ?? 0} />
          </button>
        ),
        sortingFn: (rowA, rowB) => {
          const a = rowA.original.book.reviews.at(0)?.score ?? 0;
          const b = rowB.original.book.reviews.at(0)?.score ?? 0;
          return a - b;
        },
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
        cell: (cell) => {
          return (
            <>
              {isMyLibrary ? (
                <button
                  type="button"
                  onClick={() => {
                    setBook(cell.row.original.book);
                  }}
                >
                  <IoCloseOutline className="h-5 w-5" />
                </button>
              ) : (
                <div></div>
              )}
            </>
          );
        },
        enableSorting: false,
      }),
    ],
    [setBook, isMyLibrary],
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
      <table className="table-compact table w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder ? null : (
                    <div
                      className={
                        header.column.getCanSort()
                          ? "flex cursor-pointer select-none flex-row items-center gap-px"
                          : ""
                      }
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {{
                        asc: <IoCaretUp />,
                        desc: <IoCaretDown />,
                      }[header.column.getIsSorted() as string] ?? null}
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
        open={modalIsOpen}
        onClose={closeModal}
      >
        <Dialog.Panel className="modal-box border border-base-content border-opacity-20">
          <Dialog.Title as="h3" className="font-bold">
            Poista kirja
          </Dialog.Title>
          <p className="my-4">
            Haluatko varmasti poistaa kirjan {book?.name + " "}
            kirjastostasi? Tätä toimintoa ei voi peruuttaa.
          </p>

          <div className="flex flex-row justify-end gap-4">
            <button
              className="btn-outline btn"
              onClick={async () => {
                await updateSavedBook.mutateAsync(
                  {
                    bookId: book?.id ?? "",
                    shelf: "none",
                  },
                  {
                    onSuccess: () => {
                      trpcContext.books.getSavedBooks.setData(
                        data?.filter((b) => b.bookId !== book?.id),
                      );
                      trpcContext.books.getReadingBooks.invalidate();
                    },
                  },
                );

                closeModal();
              }}
            >
              Poista
            </button>
            <button className="btn-error btn" onClick={closeModal}>
              Peruuta
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </>
  );
};

export default LibraryPage;

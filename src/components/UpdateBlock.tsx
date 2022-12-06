import { type Book } from "@prisma/client";
import Link from "next/link";
import { type z } from "zod";
import {
  updateBlocksValidator,
  updateBookValidator,
  updatesValidator,
} from "~/server/trpc/router/books";
import { formatBookProgress } from "~/utils/format-book-progress";
import { formatDate } from "~/utils/format-date";
import Avatar from "./Avatar";
import BookCover from "./BookCover";

interface UpdateProps {
  book: z.infer<typeof updateBookValidator>;
  updates: z.infer<typeof updatesValidator>;
}

export function Update({ book, updates }: UpdateProps) {
  return (
    <div>
      <div className="flex flex-row gap-4">
        <BookCover book={book as unknown as Book} size="s" />
        <div className="flex flex-col gap-1 p-0">
          <Link href={`/books/${book.id}`} className="font-bold">
            {book.name}
          </Link>
          <span className="text-sm">
            {book.authors ?? "Tuntematon kirjoittaja"}
          </span>
        </div>
      </div>

      <ol className="relative ml-4 border-l-2 border-medium">
        {updates.map((update) => (
          <li key={update.id} className="mb-8 ml-4 last:mb-0">
            <div className="absolute -left-[0.4375rem] mt-2.5 h-3 w-3 rounded-full bg-medium">
            </div>
            <time
              className="cursor-default text-sm text-medium"
              title={update.createdAt.toISOString()}
            >
              {formatDate(update.createdAt)}
            </time>
            <div className="font-bold">
              {formatBookProgress(update, book.pageCount)}
            </div>
            <div className="text-sm">{update.content}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}

interface UpdateBlockProps {
  updateBlock: z.infer<typeof updateBlocksValidator>[number];
}

function UpdateBlock({ updateBlock }: UpdateBlockProps) {
  return (
    <section
      key={updateBlock.user.id + updateBlock.book.id}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-row gap-4">
        <Avatar user={updateBlock.user} size="m" />
        <div className="flex flex-col gap-4">
          <span className="font-bold">{updateBlock.user.name}</span>
					<Update book={updateBlock.book} updates={updateBlock.updates} />
        </div>
      </div>
    </section>
  );
}

export default UpdateBlock;

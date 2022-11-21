import { type BookData } from "~/server/googlebooks/book-types";
import Image from "next/image";
import { ImFileEmpty } from "react-icons/im";
import { type Book } from "@prisma/client";

interface BookCoverProps {
  book: BookData | Book;
  size: "s" | "l";
  compact?: boolean;
}

const sizes = {
  s: {
    width: 64,
    height: 96,
    tw: "w-16",
    th: "h-24",
  },
  l: {
    width: 128,
    height: 192,
    tw: "w-32",
    th: "h-48",
  },
};

function isBookType(book: BookData | Book): book is Book {
  return (book as Book).createdAt !== undefined;
}

interface CommonBook {
  thumbnail: string | undefined | null;
  title: string | undefined | null;
}

function getCommonBook(book: BookData | Book): CommonBook {
  if (isBookType(book)) {
    return {
      thumbnail: book.thumbnailUrl,
      title: book.name,
    };
  } else {
    return {
      thumbnail: book.volumeInfo.imageLinks?.thumbnail,
      title: book.volumeInfo.title,
    };
  }
}

function BookCover({ book, size, compact }: BookCoverProps) {
  const s = sizes[size];

  if (compact) {
    s.height = s.width;
    // Take number
    s.th = "h-" + s.tw.split("-")[1];
  }

  const common = getCommonBook(book);

  return (
    <>
      {common.thumbnail ? (
        <Image
          src={common.thumbnail}
          alt={`Kirjan ${common.title} kansikuva`}
          width={s.width}
          height={s.height}
          className="my-0 h-min rounded"
          priority
        />
      ) : (
        <div
          className={`flex ${s.tw} ${s.th} justify-center rounded bg-neutral`}
        >
          <ImFileEmpty className="my-auto" />
        </div>
      )}
    </>
  );
}

export default BookCover;

import { type BookData } from "~/server/googlebooks/book-types";
import Image from "next/image";
import { ImFileEmpty } from "react-icons/im";
import { type Book } from "@prisma/client";
import Link from "next/link";
import React from "react";

interface BookCoverProps {
  book: BookData | Book;
  size: "s" | "l";
  compact?: boolean;
  withoutLink?: boolean;
}

const sizes = {
  s: { width: 64, height: 96, tw: "w-16", th: "h-24" },
  l: { width: 128, height: 192, tw: "w-32", th: "h-48" },
};

function isBookType(book: BookData | Book): book is Book {
  return (book as Book).createdAt !== undefined;
}

interface CommonBook {
  id: string;
  thumbnail: string | undefined | null;
  title: string | undefined | null;
}

function getCommonBook(book: BookData | Book): CommonBook {
  if (isBookType(book)) {
    return {
      id: book.id,
      thumbnail: book.thumbnailUrl,
      title: book.name,
    };
  } else {
    return {
      id: book.id,
      thumbnail: book.volumeInfo.imageLinks?.thumbnail,
      title: book.volumeInfo.title,
    };
  }
}

interface WrapperProps {
  children?: React.ReactNode;
  condition: boolean;
  as: (children?: React.ReactNode) => React.ReactNode;
}

export function ConditionalWrapper({ children, condition, as }: WrapperProps) {
  return <>{condition ? as(children) : children}</>;
}

function BookCover({ book, size, compact, withoutLink }: BookCoverProps) {
  const s = structuredClone(sizes[size]);

  if (compact) {
    s.height = s.width;
    // Take number
    s.th = "h-" + s.tw.split("-")[1];
  }

  const common = getCommonBook(book);

  return (
    <ConditionalWrapper
      condition={compact ?? false}
      as={(children) => (
        <div className={`overflow-clip ${s.tw} ${s.th} rounded`}>
          {children}
        </div>
      )}
    >
      <ConditionalWrapper
        condition={!withoutLink}
        as={(children) => <Link href={`/books/${common.id}`}>{children}</Link>}
      >
        {common.thumbnail
          ? (
            <Image
              src={common.thumbnail}
              alt={`Kirjan ${common.title} kansikuva`}
              width={s.width}
              height={s.height}
              className="my-0 h-min rounded"
              title={common.title ?? ""}
              priority
            />
          )
          : (
            <div
              className={`flex ${s.tw} ${s.th} items-center justify-center rounded bg-base-content text-base-300`}
              title={common.title ?? ""}
            >
              <ImFileEmpty />
            </div>
          )}
      </ConditionalWrapper>
    </ConditionalWrapper>
  );
}

export default BookCover;

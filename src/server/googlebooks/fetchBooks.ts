export interface BooksData {
  totalItems: number;
  items: BookData[];
}

export interface BookData {
  id: string;
  volumeInfo: {
    title: string;
    subtitle: string;
    authors?: string[];
    publisher: string;
    publishedDate: string;
    description: string;
    industryIdentifiers: {
      type: string;
      identifier: string;
    }[];
    pageCount: number;
    // printType: string;
    categories: string[];
    averageRating: number;
    // ratingscount: number;
    // contentVersion: string;
    imageLinks?: {
      smallThumbnail: string;
      thumbnail: string;
    };
    language: string;
    // previewLink: string;
    // infoLink: string;
    // canonicalVolumeLink: string;
  };
}

// https://kentcdodds.com/blog/using-fetch-with-type-script
export async function fetchBooks(url: string): Promise<BooksData> {
  const response = await fetch(url);

  const books: BooksData = await response.json();

  if (response.ok) {
    if (books) {
      return books;
    } else {
      return Promise.reject(new Error("No books found"));
    }
  } else {
    const error = new Error("unknown");
    return Promise.reject(error);
  }
}

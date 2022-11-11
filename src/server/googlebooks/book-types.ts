export interface BooksData {
  totalItems: number;
  items?: BookData[];
}

export interface BookData {
  id: string;
  volumeInfo: {
    title: string;
    subtitle?: string;
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
      thumbnail: string;
      small?: string;
    };
    language: string;
    // previewLink: string;
    // infoLink: string;
    // canonicalVolumeLink: string;
  };
}

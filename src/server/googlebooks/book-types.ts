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
    description?: string;
    industryIdentifiers?: {
      type: string;
      identifier: string;
    }[];
    pageCount?: number;
    categories: string[];
    averageRating: number;
    imageLinks?: {
      thumbnail: string;
      small?: string;
    };
    language: string;
  };
}

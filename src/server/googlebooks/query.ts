import { URL } from "url";
import { env } from "~/env/server.mjs";

export class BooksQuery {
  url: URL;
  baseUrl = "https://www.googleapis.com/books/v1/volumes/";

  constructor() {
    this.url = new URL(this.baseUrl);
  }

  // https://developers.google.com/books/docs/v1/using#PerformingSearch
  query(term: string) {
    this.url.searchParams.append("q", term);

    // Remove magazines from search results
    // https://developers.google.com/books/docs/v1/using#print-type
    this.url.searchParams.append("printType", "books");

    this.url.searchParams.append("fields", "totalItems,items(id,volumeInfo)");
    return this;
  }

  // https://developers.google.com/books/docs/v1/using#pagination
  page(pageIndex: number, pageLength: number) {
    this.url.searchParams.append("startIndex", pageIndex.toString());
    this.url.searchParams.append("maxResults", pageLength.toString());
    return this;
  }

  id(id: string) {
    this.url = new URL(`${id}`, this.baseUrl);
    return this;
  }

  build() {
    this.url.searchParams.append("key", env.GOOGLE_API_KEY);
    return this.url.toString();
  }
}

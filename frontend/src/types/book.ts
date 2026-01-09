export interface Author {
  id: number;
  name: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Publisher {
  id: number;
  name: string;
}

export interface Book {
  id: number;
  title: string;
  description: string;
  price: number;
  stock: number;
  isbn: string;
  published_year: number;
  authors: Author[];
  genres: Genre[];
  publisher: Publisher;
}

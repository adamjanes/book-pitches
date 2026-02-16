/**
 * Open Library API client
 * Docs: https://openlibrary.org/dev/docs/api/search
 */

export interface OLSearchResult {
  key: string; // Work key, e.g., "/works/OL45883W"
  title: string;
  author_name?: string[]; // Array of author names
  first_publish_year?: number;
  cover_i?: number; // Cover ID for constructing image URLs
  number_of_pages_median?: number;
}

export interface OLSearchResponse {
  numFound: number;
  start: number;
  docs: OLSearchResult[];
}

/**
 * Search for books on Open Library
 * @param query - Search query (title, author, or combination)
 * @returns Search results with up to 10 books
 */
export async function searchBooks(query: string): Promise<OLSearchResponse> {
  const params = new URLSearchParams({
    q: query,
    limit: '10',
    fields: 'key,title,author_name,first_publish_year,cover_i,number_of_pages_median',
  });

  const response = await fetch(
    `https://openlibrary.org/search.json?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Open Library API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch book description from Open Library work detail endpoint
 * @param workKey - Work key (e.g., "/works/OL45883W" or "OL45883W")
 * @returns Description string or null if unavailable
 */
export async function fetchBookDescription(workKey: string): Promise<string | null> {
  try {
    // Normalize work key (strip leading slash if present)
    const key = workKey.startsWith('/works/') ? workKey : `/works/${workKey}`;

    const response = await fetch(
      `https://openlibrary.org${key}.json`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Description can be a string or an object with a 'value' property
    if (typeof data.description === 'string') {
      return data.description;
    } else if (data.description && typeof data.description.value === 'string') {
      return data.description.value;
    }

    return null;
  } catch (error) {
    // Return null on any failure (network error, parse error, etc.)
    return null;
  }
}

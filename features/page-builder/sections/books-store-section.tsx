import { defineQuery, stegaClean } from "next-sanity";
import { KaijoImage } from "~/features/kaijo/kaijo-image";
import { sanityFetch } from "~/features/sanity/client";
import { ImageFragment } from "~/features/sanity/media/fragment";
import { AvailabilityLabel, overallAvailability } from "~/features/store/availability";
import { SANITY_STORE_PAGE_ID } from "~/sanity/constants";
import type { BooksListQResult, BooksStoreSectionQResult } from "~/sanity/types";
import { WorkAnchors } from "./work-overview-anchors";

/** The /store sub-nav — Books, Prints, Licensing, marked at the top like /work. */
const STORE_ANCHORS = [
  { id: "books", label: "Books" },
  { id: "prints", label: "Prints" },
  { id: "licensing", label: "Licensing" },
];

const BooksStoreSectionQ =
  defineQuery(`*[_id == $docId][0].pageBuilder.sectionsArray[_type == "booksStoreSectionField" && _key == $sectionKey][0]{
    "content": sectionContent{
      heading,
      intro
    },
    "hash": sectionSettings.sectionHash.current
}`);

const BooksListQ = defineQuery(`
  *[_type == "book" && defined(uri.current)] | order(order asc){
    _id,
    title,
    year,
    "uri": uri.current,
    shortDescription,
    coverImage{${ImageFragment}},
    "prices": variants[].price,
    "availabilities": variants[].availability
  }
`);

export async function BooksStoreSection({ docId, sectionKey }: { docId: string; sectionKey: string }) {
  const [section, books] = await Promise.all([
    sanityFetch<BooksStoreSectionQResult>({
      query: BooksStoreSectionQ,
      params: { docId, sectionKey },
      options: { next: { tags: [`doc:${docId}`, "book"] } },
    }),
    sanityFetch<BooksListQResult>({ query: BooksListQ, options: { next: { tags: ["book"] } } }),
  ]);

  const content = section?.content;

  if (!content) {
    return null;
  }

  return (
    <div id={stegaClean(section?.hash) || undefined} className="section_books section-padding-top section-padding-bottom">
      <div className="container">
        {docId === SANITY_STORE_PAGE_ID && <WorkAnchors anchors={STORE_ANCHORS} />}
        <div className="books_head">
          {content.heading && (
            <h1 data-scramble="scroll" className="section_title">
              {content.heading}
            </h1>
          )}
          {content.intro && <p className="books_intro">{content.intro}</p>}
        </div>

        <div className="books_grid">
          {(books ?? []).map((book) => {
            const prices = (book.prices ?? []).filter((p): p is number => typeof p === "number");
            const fromPrice = prices.length > 0 ? Math.min(...prices) : null;
            const status = overallAvailability(book.availabilities ?? []);
            return (
              <a key={book._id} href={book.uri ?? "#"} className="books_entry">
                <div className="books_entry-media">
                  {book.coverImage && (
                    <KaijoImage image={book.coverImage} className="books_entry-cover" sizes="(max-width: 767px) 100vw, 45vw" />
                  )}
                </div>
                <div className="books_entry-info">
                  <h2 className="books_entry-title">{book.title}</h2>
                  {book.year && <span className="books_entry-year">{book.year}</span>}
                  {book.shortDescription && <p className="books_entry-desc">{book.shortDescription}</p>}
                  <div className="books_entry-meta">
                    {fromPrice !== null && (
                      <span className="books_entry-price">
                        {prices.length > 1 ? "from " : ""}€{fromPrice}
                      </span>
                    )}
                    <AvailabilityLabel status={status} />
                  </div>
                  <span className="books_entry-cta">View book →</span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { defineQuery } from "next-sanity";
import { env } from "~/env";
import { KaijoImage } from "~/features/kaijo/kaijo-image";
import { sanityFetch } from "~/features/sanity/client";
import { ImageFragment } from "~/features/sanity/media/fragment";
import { getImageSrc } from "~/features/sanity/media/image/utils";
import { SeoMetadataFragment } from "~/features/site/seo/fragment";
import { seo } from "~/features/site/seo/utils";
import { SiteShell } from "~/features/site/site-shell";
import { BookPurchase } from "~/features/store/book-purchase";
import type { BookNavQResult, BookPageQResult } from "~/sanity/types";

const BookPageQ = defineQuery(`
  *[_type == "book" && defined(uri.current) && uri.current == $uri][0]{
    _id,
    title,
    year,
    "uri": uri.current,
    shortDescription,
    variants[]{ "key": _key, name, price, availability, image{${ImageFragment}} },
    specifications[]{ "key": _key, label, value },
    coverImage{${ImageFragment}},
    "relatedProject": relatedProject->{ title, "uri": "/project/" + slug.current },
    "seoMetadata": seoMetadata{${SeoMetadataFragment}}
  }
`);

const BookNavQ = defineQuery(`
  *[_type == "book" && defined(uri.current)] | order(order asc){
    _id, title, "uri": uri.current, coverImage{${ImageFragment}}
  }
`);

const BookUrisQ = defineQuery(`*[_type == "book" && defined(uri.current)]{ "uri": uri.current }`);

async function fetchBook(uri: string) {
  return sanityFetch<BookPageQResult>({
    query: BookPageQ,
    params: { uri },
    options: { next: { tags: [uri, "book"] } },
  });
}

export async function generateStaticParams() {
  const uris = await sanityFetch<{ uri: string }[]>({ query: BookUrisQ, live: false });
  return uris.map(({ uri }) => ({ slug: uri.replace("/books/", "") }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const book = await fetchBook(`/books/${params.slug}`);
  const { title, description, image, robots } = book?.seoMetadata ?? {};
  return await seo({
    robots,
    title: title ?? book?.title ?? "Not Found",
    description: description ?? book?.shortDescription ?? undefined,
    image,
    canonical: `${env.NEXT_PUBLIC_URL}/books/${params.slug}`,
  });
}

export default async function BookPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const uri = `/books/${params.slug}`;
  const [book, allBooks] = await Promise.all([
    fetchBook(uri),
    sanityFetch<BookNavQResult>({ query: BookNavQ, options: { next: { tags: ["book"] } } }),
  ]);

  if (!book) {
    notFound();
  }

  const variants = (book.variants ?? []).filter((v): v is typeof v & { key: string; name: string; price: number } =>
    Boolean(v.key && v.name && typeof v.price === "number")
  );
  const coverUrl = book.coverImage ? getImageSrc(book.coverImage, { width: 240 }) : "";
  const otherBook = (allBooks ?? []).find((b) => b._id !== book._id);

  return (
    <SiteShell>
      <div className="section_book">
        <div className="container">
          <BookPurchase
            bookId={book._id}
            slug={params.slug}
            title={book.title ?? "Book"}
            coverUrl={coverUrl}
            coverImage={book.coverImage}
            variants={variants}
          >
            <h1 data-scramble="scroll" className="section_title book-title">
              {book.title}
            </h1>
            {book.specifications && book.specifications.length > 0 && (
              <dl className="book-specs">
                {book.specifications.map((spec) => (
                  <div key={spec.key} className="book-specs_row">
                    <dt>{spec.label}</dt>
                    <dd>{spec.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </BookPurchase>

          {book.shortDescription && <p className="book-description">{book.shortDescription}</p>}
        </div>

        <div className="container">
          {book.relatedProject?.uri && (
            <div className="book-related">
              <span className="book-related_label">Related project</span>
              <a href={book.relatedProject.uri} className="book-related_link">
                {book.relatedProject.title} →
              </a>
            </div>
          )}

          <nav className="book-nav" aria-label="More books">
            {otherBook?.uri && (
              <a href={otherBook.uri} className="book-nav_other">
                {otherBook.coverImage && <KaijoImage image={otherBook.coverImage} className="book-nav_cover" sizes="120px" />}
                <span className="book-nav_other-text">
                  <span className="book-nav_other-label">Next book</span>
                  <span className="book-nav_other-title">{otherBook.title} →</span>
                </span>
              </a>
            )}
            <a href="/store#books" className="book-nav_back">
              ← Back to Books
            </a>
          </nav>
        </div>
      </div>
    </SiteShell>
  );
}

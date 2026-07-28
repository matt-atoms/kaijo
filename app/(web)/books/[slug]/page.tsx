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
import { AddToCart } from "~/features/store/add-to-cart";
import type { BookNavQResult, BookPageQResult } from "~/sanity/types";

const BookPageQ = defineQuery(`
  *[_type == "book" && defined(uri.current) && uri.current == $uri][0]{
    _id,
    title,
    year,
    "uri": uri.current,
    shortDescription,
    variants[]{ "key": _key, name, price, availability },
    specifications[]{ "key": _key, label, value },
    coverImage{${ImageFragment}},
    images[]{${ImageFragment}},
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
  const images = (book.images ?? []).filter((image) => image?._id);
  const coverUrl = book.coverImage ? getImageSrc(book.coverImage, { width: 240 }) : "";
  const otherBook = (allBooks ?? []).find((b) => b._id !== book._id);

  return (
    <SiteShell>
      <div className="section_book">
        <div className="container">
          <div className="book-header">
            <div className="book-header_media">
              {book.coverImage && (
                <KaijoImage image={book.coverImage} className="book-header_cover" sizes="(max-width: 991px) 100vw, 50vw" />
              )}
            </div>
            <div className="book-header_info">
              <h1 data-scramble="scroll" className="section_title book-title">
                {book.title}
              </h1>
              {book.year && <p className="book-year">{book.year}</p>}
              {variants.length > 0 && (
                <AddToCart
                  bookId={book._id}
                  slug={params.slug}
                  title={book.title ?? "Book"}
                  coverUrl={coverUrl}
                  variants={variants}
                />
              )}
            </div>
          </div>

          {book.shortDescription && <p className="book-description">{book.shortDescription}</p>}
        </div>

        {images.length > 0 && (
          <div className="book-images">
            {images.map((image, index) => (
              <figure key={image._id} className="book-image" data-index={index % 4}>
                <KaijoImage image={image} className="book-image_img" sizes="(max-width: 991px) 100vw, 80vw" />
              </figure>
            ))}
          </div>
        )}

        <div className="container">
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
            <a href="/books" className="book-nav_back">
              ← Back to Books
            </a>
          </nav>
        </div>
      </div>
    </SiteShell>
  );
}

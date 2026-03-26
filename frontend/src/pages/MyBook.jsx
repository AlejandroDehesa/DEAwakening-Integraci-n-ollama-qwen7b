import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { getSectionExtra } from "../services/contentService";

const BOOK_PURCHASE_URL =
  "https://buy.stripe.com/test_8x2bIT9uScWSaEy9rf7IY00";

const fallbackContent = {
  pageTitle: "My Book",
  title: "",
  author: "",
  subtitle: "",
  intro: "",
  keyMessage: "",
  storyTitle: "",
  storyPoints: [],
  valueTitle: "",
  valuePoints: [],
  discoverTitle: "",
  discoverPoints: [],
  audienceTitle: "",
  audiencePoints: [],
  statusTitle: "",
  statusText: "",
  coverAlt: "Book cover",
  ctaBuy: "",
  ctaPrimary: "",
  ctaSecondary: ""
};

function MyBook() {
  const { currentLanguage } = useLanguage();
  const [content, setContent] = useState(fallbackContent);

  useEffect(() => {
    let ignore = false;

    async function loadContent() {
      try {
        const data = await getSectionExtra("book.page", currentLanguage, fallbackContent);
        if (!ignore) {
          setContent({
            ...fallbackContent,
            ...data
          });
        }
      } catch {
        if (!ignore) {
          setContent(fallbackContent);
        }
      }
    }

    loadContent();

    return () => {
      ignore = true;
    };
  }, [currentLanguage]);

  usePageTitle(content.pageTitle || "My Book");

  return (
    <section className="section book-page-section">
      <div className="container book-page-stack">
        <header className="card book-title-card">
          <h1 className="book-main-title">{content.title}</h1>
        </header>

        <header className="card book-hero-card">
          <div className="book-hero-layout">
            <div className="book-hero-copy">
              <p className="panel-label book-author">{content.author}</p>
              <p className="book-subtitle">{content.subtitle}</p>
              <p className="lead">{content.intro}</p>

              <blockquote className="book-key-message">{content.keyMessage}</blockquote>

              <div className="button-row">
                <a
                  className="btn btn-primary"
                  href={BOOK_PURCHASE_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  {content.ctaBuy}
                </a>
                <Link className="btn btn-primary" to="/contact">
                  {content.ctaPrimary}
                </Link>
                <Link className="btn btn-outline" to="/events">
                  {content.ctaSecondary}
                </Link>
              </div>
            </div>

            <figure className="book-cover-wrap">
              <img
                className="book-cover-image"
                src="/finding-resosense-book.jpg"
                alt={content.coverAlt}
                loading="lazy"
              />
            </figure>
          </div>
        </header>

        <div className="book-main-grid">
          <article className="card book-card">
            <h2>{content.storyTitle}</h2>
            <ul className="feature-list">
              {content.storyPoints.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="card book-card">
            <h2>{content.valueTitle}</h2>
            <ul className="feature-list">
              {content.valuePoints.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>

        <div className="book-secondary-grid">
          <article className="card book-card">
            <h3>{content.discoverTitle}</h3>
            <ul className="feature-list">
              {content.discoverPoints.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="card book-card">
            <h3>{content.audienceTitle}</h3>
            <ul className="feature-list">
              {content.audiencePoints.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="card book-card book-status-card">
            <p className="panel-label">{content.statusTitle}</p>
            <p>{content.statusText}</p>
          </article>
        </div>
      </div>
    </section>
  );
}

export default MyBook;

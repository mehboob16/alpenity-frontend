import React from "react";
import { TableOfContents, slugify } from "./TableOfContents";
import "./Article.css"; // We'll replace this CSS next

// Safe HTML renderer (same as before)
function SafeHtmlRenderer({ htmlContent }) {
  // We trust the data from our n8n workflow
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}

function ArticlePage({ article, onApproveClick }) {
  return (
    <div className="article-container">
      {/* 1. ARTICLE HERO (Title) */}
      {/* The Alpenity site has the title in a top hero block */}
      <header className="article-hero">
        <div className="article-hero-inner">
          <h1 className="article-title">{article.heading}</h1>
        </div>
      </header>

      {/* 2. FEATURED IMAGE (Full width) */}
      <img
        src={article.image}
        alt={article.heading}
        className="article-main-image"
      />

      {/* 3. TWO-COLUMN LAYOUT */}
      <div className="article-content-wrapper">
        {/* COLUMN 1: STICKY TABLE OF CONTENTS */}
        <aside className="article-toc-container">
          <TableOfContents
            sections={article.sections}
            onApproveClick={onApproveClick}
          />
        </aside>

        {/* COLUMN 2: MAIN BODY CONTENT */}
        <main className="article-body-content">
          {/* Author meta comes *after* the image here */}
          <div className="article-meta">
            <img
              src="https://via.placeholder.com/40" // Placeholder
              alt="Author"
              className="author-avatar"
            />
            <div>
              <span className="author-name">{article.author}</span>
              <span className="author-title">{article.author_title}</span>
              <span className="article-date">{article.date}</span>
            </div>
          </div>

          {/* The main intro description */}
          <p className="article-description">{article.description}</p>

          {/* All the sections */}
          {article.sections.map((section, index) => (
            <section
              key={index}
              className="article-section"
              id={slugify(section.title)}
            >
              <h2>{section.title}</h2>
              {/* Note: We render the description inside the SafeHtmlRenderer */}
              <SafeHtmlRenderer htmlContent={section.description} />
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}

export default ArticlePage;

import React from "react";
import "./Article.css"; // Share the CSS

// Helper function (same as before)
const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

function TableOfContents({ sections, onApproveClick }) {
  return (
    <div className="article-toc-sticky-wrapper">
      <div className="article-toc">
        {/* Back to Newsroom button, as seen on the site */}
        <a href="#" className="back-to-newsroom-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="12"
            viewBox="0 0 16 12"
            fill="none"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.77532 0.558058C7.01939 0.802136 7.01939 1.19786 6.77532 1.44194L2.84226 5.375H14.6667C15.0119 5.375 15.2917 5.65482 15.2917 6C15.2917 6.34518 15.0119 6.625 14.6667 6.625H2.84226L6.77532 10.5581C7.01939 10.8021 7.01939 11.1979 6.77532 11.4419C6.53124 11.686 6.13551 11.686 5.89143 11.4419L0.891432 6.44194C0.647355 6.19786 0.647355 5.80214 0.891432 5.55806L5.89143 0.558058C6.13551 0.313981 6.53124 0.313981 6.77532 0.558058Z"
              fill="currentColor"
            ></path>
          </svg>
          <span>Back to Newsroom</span>
        </a>

        {/* The TOC itself */}
        <h4 className="toc-title">Table of Contents</h4>
        <ol className="toc-list">
          {sections.map((section, index) => (
            <li key={index}>
              <a href={`#${slugify(section.title)}`}>{section.title}</a>
            </li>
          ))}
        </ol>

        {/* Our custom approval button */}
        <button className="approve-button" onClick={onApproveClick}>
          Approve & Send to n8n
        </button>
      </div>
    </div>
  );
}

export { TableOfContents, slugify };

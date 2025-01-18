export const MarkdownSyntaxHelp = () => (
  <div
    style={{
      marginTop: "20px",
      padding: "10px",
      backgroundColor: "#f9f9f9",
      border: "1px solid #ddd",
      borderRadius: "5px",
      fontSize: "0.9rem",
    }}
  >
    <h4>Markdown Syntax Help</h4>
    <ul>
      <li>
        <code># Header 1</code> - For main headings
      </li>
      <li>
        <code>## Header 2</code> - For subheadings
      </li>
      <li>
        <code>*Italic*</code> or <code>_Italic_</code> - For italic text
      </li>
      <li>
        <code>**Bold**</code> or <code>__Bold__</code> - For bold text
      </li>
      <li>
        <code>[Link text](URL)</code> - For creating hyperlinks
      </li>
      <li>
        <code>![Alt text](ImageURL)</code> - For inserting images
      </li>
    </ul>
  </div>
);

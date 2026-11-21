// The website's editor API cleans article HTML to safe tags when it is saved (clean_article_html).
export const safeArticleHtml = (html: string) => String(html || '');

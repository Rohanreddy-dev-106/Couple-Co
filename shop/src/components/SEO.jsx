import { useEffect } from 'react';

export default function SEO({ title, description, keywords }) {
  useEffect(() => {
    // Set the document title
    document.title = title ? `${title} | Couple Chaos` : "Couple Chaos | Premium Streetwear";
    
    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    const defaultDesc = "Discover premium quality, graphic t-shirts and streetwear at Couple Chaos. Shop our exclusive collection today.";
    
    if (metaDescription) {
      metaDescription.setAttribute('content', description || defaultDesc);
    } else {
      metaDescription = document.createElement('meta');
      metaDescription.name = "description";
      metaDescription.content = description || defaultDesc;
      document.head.appendChild(metaDescription);
    }

    // Update or create meta keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', keywords);
      } else {
        metaKeywords = document.createElement('meta');
        metaKeywords.name = "keywords";
        metaKeywords.content = keywords;
        document.head.appendChild(metaKeywords);
      }
    }
  }, [title, description, keywords]);

  return null;
}

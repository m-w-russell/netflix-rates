const baseURL = "https://netflix-rates-proxy.max-9a7.workers.dev/";

const getShowName = () => {
  return document.querySelector('div.storyArt img')?.alt ?? null;
};

const getRating = async (params) => {
  console.log(`${baseURL}s?${params}`);
  const res = await fetch(`${baseURL}s?${params}`);
  return res.json();
};

console.log('[nf-rate] content script loaded', location.href);

let lastTitle = null;
let debounceTimer = null;

const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const title = getShowName();
    if (!title || title === lastTitle) return; // no change, skip
    lastTitle = title;

    const params = new URLSearchParams({ title: title });
    getRating(params).then((data) => {
      console.log('[nf-rate]', title, data);
      const details = document.querySelector('.videoMetadata--line')

      const ratingBadge = document.createElement("a");
      ratingBadge.innerText = `IMDb ${data.imdbRating}/10`;
      ratingBadge.classList.add('imdb-rating');
      ratingBadge.href = `https://www.imdb.com/title/${data.imdbID}`
      ratingBadge.target = '_blank';

      details.appendChild(ratingBadge);

    });


  }, 500); // wait for DOM to settle
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

window.addEventListener('load', (event) => {
  console.log("Injecting CSS...");
  const css = document.createElement("style");
  css.textContent = `
.imdb-rating {
  background: #393939;
  padding: 2px 10px;
  border-radius: 4px;
  text-decoration: none;
}

.imdb-rating:hover {
  background: #5f5f5f;
}
`


  document.head.appendChild(css);




});
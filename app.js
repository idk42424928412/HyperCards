const form = document.querySelector('#searchForm');
const input = document.querySelector('#searchInput');
const results = document.querySelector('#results');
const status = document.querySelector('#status');
const privacyButton = document.querySelector('#privacyButton');
const privacyDialog = document.querySelector('#privacyDialog');
const closePrivacy = document.querySelector('#closePrivacy');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const q = input.value.trim();
  if (!q) return;

  status.textContent = 'Searching…';
  results.replaceChildren();

  try {
    const response = await fetch(`/api/cards/search?q=${encodeURIComponent(q)}`, {
      headers: { 'Accept': 'application/json' }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Search failed');

    status.textContent = data.items.length ? `${data.items.length} result${data.items.length === 1 ? '' : 's'}` : 'No matching cards.';
    for (const card of data.items) {
      const article = document.createElement('article');
      article.className = 'card';
      const details = document.createElement('div');
      const name = document.createElement('h2');
      name.textContent = card.name;
      const id = document.createElement('div');
      id.className = 'id';
      id.textContent = `ID: ${card.id}`;
      details.append(name, id);
      const price = document.createElement('div');
      price.className = 'price';
      price.textContent = card.price;
      article.append(details, price);
      results.append(article);
    }
  } catch (error) {
    status.textContent = error.message || 'Unable to search right now.';
  }
});

privacyButton.addEventListener('click', () => privacyDialog.showModal());
closePrivacy.addEventListener('click', () => privacyDialog.close());

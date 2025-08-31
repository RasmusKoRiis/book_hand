const toggle  = document.getElementById('filterToggle');
const label   = document.getElementById('filterLabel');
const grid    = document.getElementById('grid');
let books     = [];
let filter    = 'reading';

function loadBooks(){
  Papa.parse('data/books.csv', {
    download: true, header: true, skipEmptyLines: true,
    complete: (res) => {
      books = res.data;

      // sort first (newest read first; "reading" with empty date stay on top)
      books.sort((a,b)=>{
        const da = a.date_read || '9999-12-31';
        const db = b.date_read || '9999-12-31';
        return new Date(db) - new Date(da);
      });

      renderGrid();

      const first = books.find(b => b.status === 'reading') || books[0];
      first && showBook(first, false);
    }
  });
}

function renderGrid(){
  grid.innerHTML = '';
  const frag = document.createDocumentFragment();

  books
    .filter(b => filter === 'all' || b.status === 'reading')
    .forEach(b => {
      const img = document.createElement('img');
      img.src = `assets/${b.cover_image}`;
      img.alt = b.title;
      img.className = 'thumbnail';

      // Speed wins: lazy load and async decode, low fetch priority
      img.loading = 'lazy';
      img.decoding = 'async';
      img.setAttribute('fetchpriority', 'low');

      img.addEventListener('click', () => {
        showBook(b, true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      frag.appendChild(img);
    });

  grid.appendChild(frag);
}

function updateLabel(){
  label.textContent = filter==='all' ? 'Read' : 'Currently Reading';
}

function showBook(b,animate=true){
  const display=document.querySelector('.book-display');
  const hand   =display.querySelector('.hand');
  const cover  =display.querySelector('#cover');

  const swap=()=>{
    cover.src=`assets/${b.cover_image}`;
    document.getElementById('title').textContent   = b.title;
    document.getElementById('author').textContent  = b.author;
    document.getElementById('released').textContent= b.release_date;
    document.getElementById('read').textContent    = b.date_read;
    document.getElementById('comment').textContent = b.comment;
  };

  if(!animate){swap();return;}

  gsap.timeline()
    .to([cover,hand],{y:60,opacity:0,duration:.25,ease:'power1.in'})
    .add(swap)
    .fromTo([cover,hand],{y:-60,opacity:0},{y:0,opacity:1,duration:.25,ease:'power1.out'});
}

toggle.addEventListener('change',()=>{
  filter = toggle.checked ? 'all' : 'reading';
  renderGrid();
  updateLabel();
});

document.addEventListener('DOMContentLoaded',()=>{loadBooks();updateLabel();});
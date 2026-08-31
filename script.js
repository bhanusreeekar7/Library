let currentSection = "all";
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let wantToRead = JSON.parse(localStorage.getItem("wantToRead")) || [];
let currentBooks = [];

const searchInput = document.getElementById("search-input");
const searchbtn = document.querySelector(".search-container button");
const sectionTitle = document.getElementById("section-title");
const favoritesbtn = document.getElementById("favorites-btn");
const allbooksbtn = document.getElementById("all-books-btn");
const wantToReadbtn = document.getElementById("want-to-read-btn");
const bookgrid = document.getElementById("book-grid");
const status = document.getElementById("status");

function getCurrentBooks() {
    if (currentSection === "all") return currentBooks;
    if (currentSection === "favorites") return favorites;
    if (currentSection === "wantToRead") return wantToRead;
}

function renderCurrentSection() {
    displaybooks(getCurrentBooks());
}

function displaybooks(bookList) {
    bookgrid.innerHTML = "";

    bookList.forEach(function(book) {
        const card = document.createElement("article");
        card.classList.add("book-card");

        const isFavorite = favorites.some(function(favorite) {
            return favorite.id === book.id;
        });

        const isWantToRead = wantToRead.some(function(item) {
            return item.id === book.id;
        });

        card.innerHTML = `
            <img src="${book.cover}" alt="${book.title}">
            <h3>${book.title}</h3>
            <p>${book.author}</p>
            <div class="book-actions">
                <button class="favorite-btn" data-id="${book.id}">
                    ${isFavorite ? "♥" : "♡"}
                </button>
                <button class="want-to-read-btn" data-id="${book.id}">
                    ${isWantToRead ? "✓ Want to Read" : "+ Want to Read"}
                </button>
            </div>
        `;
        bookgrid.appendChild(card);
    });
}

searchInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        searchbooks();
    }
});

searchbtn.addEventListener("click", searchbooks);

async function searchbooks() {
    const searchterm = searchInput.value.toLowerCase();

    if (searchterm === "") {
        alert("please enter a book name");
        return;
    }

    try {
        const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchterm)}`);
        const data = await response.json();

        currentBooks = data.docs.map(function(book) {
            return {
                id: book.key,
                title: book.title,
                author: book.author_name ? book.author_name[0] : "Unknown Author",
                cover: book.cover_i
                    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                    : "https://via.placeholder.com/150x220"
            };
        });
        currentSection = "all";
        displaybooks(currentBooks);
        sectionTitle.textContent = "All Books";
        status.textContent = `${currentBooks.length} books found`;
    } catch(error) {
        status.textContent = "Something went wrong. Please try again.";
        console.log(error);
    }
}

bookgrid.addEventListener("click", function(event) {
    if (event.target.classList.contains("favorite-btn")) {
        const bookID = event.target.dataset.id;
        const currentList = getCurrentBooks();

        const book = currentList.find(function(book) {
            return book.id === bookID;
        });
        const alreadyfav = favorites.some(function(book) {
            return book.id === bookID;
        });

        if (book && !alreadyfav) {
            favorites.push(book);
        } else if (alreadyfav) {
            favorites = favorites.filter(function(favorite) {
                return favorite.id !== bookID;
            });
        }
        localStorage.setItem("favorites", JSON.stringify(favorites));
        renderCurrentSection();
    }

    if (event.target.classList.contains("want-to-read-btn")) {
        const bookID = event.target.dataset.id;
        const currentList = getCurrentBooks();

        const book = currentList.find(function(book) {
            return book.id === bookID;
        });

        const alreadyWantToRead = wantToRead.some(function(book) {
            return book.id === bookID;
        });

        if (book && !alreadyWantToRead) {
            wantToRead.push(book);
        } else if (alreadyWantToRead) {
            wantToRead = wantToRead.filter(function(book) {
                return book.id !== bookID;
            });
        }

        localStorage.setItem("wantToRead", JSON.stringify(wantToRead));
        renderCurrentSection();
    }
});

favoritesbtn.addEventListener("click", function() {
    currentSection = "favorites";
    renderCurrentSection();
    sectionTitle.textContent = "Favorites";
    status.textContent = `${favorites.length} books`;
});

allbooksbtn.addEventListener("click", function() {
    currentSection = "all";
    renderCurrentSection();
    sectionTitle.textContent = "All Books";
    status.textContent = `${currentBooks.length} books found`;
});
wantToReadbtn.addEventListener("click", function() {
    currentSection = "wantToRead";
    renderCurrentSection();
    sectionTitle.textContent = "Want to Read";
    status.textContent = `${wantToRead.length} books`;
});
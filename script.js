let currentSection = "all";
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let currentBooks = [];

const searchInput=document.getElementById("search-input");
const searchbtn=document.querySelector(".search-container button");

const sectionTitle = document.getElementById("section-title");
const favoritesbtn = document.getElementById("favorites-btn");
const allbooksbtn = document.getElementById("all-books-btn");
const bookgrid=document.getElementById("book-grid");

function displaybooks(bookList)
{
    bookgrid.innerHTML="";
    bookList.forEach(function(book)
{
    const card=document.createElement("article");
    card.classList.add("book-card");
    const isFavorite = favorites.some(function(favorite) {
    return favorite.id === book.id;
    });
    card.innerHTML=`
    <img src="${book.cover}" alt="${book.title}">
            <h3>${book.title}</h3>
            <p>${book.author}</p>
            <div class="book-actions">
                <button class="favorite-btn" data-id="${book.id}">
    ${isFavorite ? "♥" : "♡"}
</button>
                <button>+ Want to Read</button>
            </div>

    `;
    bookgrid.appendChild(card);
})
}

searchInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        searchbooks();
    }

});


const status = document.getElementById("status");


searchbtn.addEventListener("click",searchbooks);

async function searchbooks()
{
    const searchterm=searchInput.value.toLowerCase();
    if(searchterm==="")
    {
        alert("please enter a book name");
        return;
    }
    try
    {
        const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchterm)}`);
        const data = await response.json();
        currentBooks=data.docs.map(function(book)
        {
        return{
                id: book.key,
                title: book.title,
                author: book.author_name ? book.author_name[0] : "Unknown Author",
                cover: book.cover_i
                    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                    : "https://via.placeholder.com/150x220"

                };
        });
        displaybooks(currentBooks);
        status.textContent = `${currentBooks.length} books found`;
    }
    catch(error)
    {
        status.textContent = "Something went wrong. Please try again.";

        console.log(error);

    }
    
}

bookgrid.addEventListener("click", function(event) {

    if (event.target.classList.contains("favorite-btn")) {

        const bookID = event.target.dataset.id;

        let book;

        if (currentSection === "all") {
            book = currentBooks.find(function(book) {
                return book.id === bookID;});
            }
        else if (currentSection === "favorites") {
            book = favorites.find(function(book) {
                return book.id === bookID;});
        }
        const alreadyfav = favorites.some(function(book) {
            return book.id === bookID;
        });
        if (book && !alreadyfav) {
            favorites.push(book);
        }
        else if (alreadyfav) {
            favorites = favorites.filter(function(favorite) {
                return favorite.id !== bookID;
            });

        }
        localStorage.setItem("favorites", JSON.stringify(favorites));
        if (currentSection === "all") {
        displaybooks(currentBooks);
        }
        else if (currentSection === "favorites") {
        displaybooks(favorites);
        }
    }
});

favoritesbtn.addEventListener("click", function() {
    displaybooks(favorites);
    sectionTitle.textContent = "Favorites";
    status.textContent = `${favorites.length} books`;
    currentSection = "favorites";
});

allbooksbtn.addEventListener("click", function() {
    currentSection = "all";
    displaybooks(currentBooks);
    status.textContent = `${currentBooks.length} books found`;
    sectionTitle.textContent = "All Books";

});
const toastLiveExample = document.getElementById('error-toast');

const paginationElement = document.getElementById('pagination');
const usersElement = document.getElementById("users");
const loaderElement = document.getElementById("loader");
const queryInput = document.getElementById('query');
const usernameInput = document.getElementById('username');
const detailsElement = document.getElementById("details");
let typingTimer1;
let typingTimer2;

let usersReference = [];
let users = [];

let page = 1;
let perPage = 10;

async function fetchUsers() {
    const username = document.getElementById('username').value.trim();

    const response = await fetch(`https://api.github.com/search/users?q=${encodeURIComponent(username)}&per_page=${perPage}&page=${page}`);

    if (response.ok) {
        users = await response.json();

        if (users.total_count > 1000) {
            users.total_count = 1000; // limited by github
        }
        usersReference = users;

    } else {
        users = await response.json();

        if (users.message != undefined) {

            showErrorToast(users.message + " Please try again later.");

        }
        else {
            showErrorToast("No user found...");

        }

        users = {
            total_count: 0,
            items: []
        };
        usersReference = users;
    }


}


async function displayUsers() {

    const username = document.getElementById('username').value.trim();

    if (username == "") {
        showErrorToast("Please enter valid username to search");
        return 0;
    }
    else {

        detailsElement.classList.add("d-none");
        loaderElement.classList.remove("d-none");
        paginationElement.innerHTML = '';

        await fetchUsers();




        let htmlStr = "";

        users.items.map(data => {
            htmlStr += `
                <div class="bg-light-dark about text-center" style="max-width: 100%;">
                   <a class="text-decoration-none" href="./view_repo.html?username=${data.login}">
                    <div 
                        style="border-radius: 20px; max-width: fit-content; background-color: #45434C; padding: 20px; margin: auto;">
                        <img src="${data.avatar_url}" class="img-fluid avatarImg" style="max-width: 100px; border-radius: 50%;display:none;"
                             alt="avatarImg">
                        <div class="loader imgLoader" style="display:block;"></div>
                        
                    </div>
                    <h5 class="mt-2 name text-light" id="name">${data.name ?? data.login}</h5>

                </a>

                </div>
                `;
        });

        if (users.items.length === 0) {
            htmlStr += "<span>No user found...</span>"

        }

        usersElement.innerHTML = htmlStr;

        loaderElement.classList.add("d-none");
        detailsElement.classList.remove("d-none");

        const imagesDiv = document.getElementsByClassName('avatarImg');
        const imgLoaderDiv = document.getElementsByClassName('imgLoader');
        const imagesArray = Array.from(imagesDiv);
        imagesArray.forEach((ele, index) => {
            const myImage = new Image();
            
            myImage.src = ele.src;
            myImage.onload = function () {
                imgLoaderDiv[index].style.display = "none"; // Hide the loader
                ele.style.display = "block"; // Show the image
            };

            // Triggered if there is an error loading the image
            myImage.onerror = function () {
                console.error("Error loading image");
                imgLoaderDiv[index].style.display = "none"; // Hide the loader
                ele.style.display = "block"; // Show the image
            };


        })



        updatePagination();
    }

}

async function updatePagination() {

    const totalCnt = users.total_count;
    const totalPages = Math.ceil(totalCnt / perPage);

    // Generate pagination pages
    paginationElement.innerHTML = '';
    let dotCount1 = 0;
    let dotCount2 = 0;
    const li = document.createElement('li');
    li.className = `page-item mb-1 ${page == 1 ? 'disabled' : ''}`;
    li.innerHTML = `<a class="page-link cursor-pointer"  href="javascript:void(0)" onclick="changePage(${(page - 1) < 0 ? 0 : (page - 1)})" >Prev</a>`;
    paginationElement.appendChild(li);

    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item mb-1 ${page == i ? 'active' : ''}`;

        if (totalPages > 7) {
            if ((i < (page - 2)) && i > 1) {
                if (dotCount1 < 1) {
                    li.innerHTML = `<span class="page-link"  >...</span>`;
                    paginationElement.appendChild(li);
                    dotCount1++;
                }
                continue;
            }
            if (((i > (page + 2))) && i < (totalPages - 1)) {
                if (dotCount2 < 1) {
                    li.innerHTML = `<span class="page-link"  >...</span>`;
                    paginationElement.appendChild(li);
                    dotCount2++;
                }
                continue;
            }

        }

        li.innerHTML = `<a class="page-link cursor-pointer"  href="javascript:void(0)" onclick="changePage(${i})" >${i}</a>`;

        paginationElement.appendChild(li);

    }
    const li2 = document.createElement('li');
    li2.className = `page-item mb-1 ${page == totalPages ? 'disabled' : ''}`;
    li2.innerHTML = `<a class="page-link cursor-pointer"  href="javascript:void(0)" onclick="changePage(${(page + 1) > totalPages ? totalPages : (page + 1)})" >Next</a>`;
    paginationElement.appendChild(li2);

}

function changePage(pageDelta) {
    // clean query search bar

    page = pageDelta;
    displayUsers();
}

displayUsers();


function copyMyId() {
    page = 1;
    document.getElementById('username').value = "piyush";
    displayUsers();
}

function setPerPage(select) {
    page = 1;
    perPage = select.value;
    displayUsers();
}

function showErrorToast(message) {
    document.getElementById("error-toast-message").innerText = message;
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
    toastBootstrap.show();
}

usernameInput.addEventListener('input', function () {
    clearTimeout(typingTimer2);
    typingTimer2 = setTimeout(function () {
        page = 1;
        displayUsers();
    }, 1500);
});






const toastLiveExample = document.getElementById('error-toast');

const paginationElement = document.getElementById('pagination');
const noUserElement = document.getElementById('no-user-found');
const usersElement = document.getElementById("users");
const loaderElement = document.getElementById("loader");
const queryInput = document.getElementById('query');
const usernameInput = document.getElementById('username')
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
        usersReference = users;
    } else {
        users = {
            total_count: 0,
            items: []
        };
        usersReference = users;
        document.getElementById("error-toast-message").innerText = "No user found...";
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
        toastBootstrap.show()
        return 0;
    }


}


async function displayUsers() {
    const username = document.getElementById('username').value.trim();

    if (username == "") {
        document.getElementById("error-toast-message").innerText = "Please enter valid username to search";
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
        toastBootstrap.show()
        return 0;
    }
    else {

        usersElement.classList.add("d-none");
        noUserElement.classList.add("d-none");
        loaderElement.classList.remove("d-none");
        paginationElement.innerHTML = '';

        await fetchUsers();


        if (users.items.length === 0) {
            document.getElementById("error-toast-message").innerText = "No user found for given name";
            const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
            toastBootstrap.show();
            loaderElement.classList.add("d-none");
            usersElement.classList.add("d-none");
            noUserElement.classList.remove("d-none");

        }
        else {

            let htmlStr = "";

            users.items.map(data => {
                htmlStr += `
                <div class="bg-light-dark about text-center" style="max-width: 100%;">
                   <a class="text-decoration-none" href="./view_repo.html?username=${data.login}">
                    <div 
                        style="border-radius: 20px; max-width: fit-content; background-color: #45434C; padding: 20px; margin: auto;">
                        <img src="${data.avatar_url}" class="img-fluid" style="max-width: 100px; border-radius: 50%;"
                            id="avatarImg" alt="avatar">
                    </div>
                    <h5 class="mt-2 name text-light" id="name">${data.name ?? data.login}</h5>

                </a>

                </div>
                `;
            });

            usersElement.innerHTML = htmlStr;
            noUserElement.classList.add("d-none");
            loaderElement.classList.add("d-none");
            usersElement.classList.remove("d-none");

        }

        updatePagination();
    }

}

async function updatePagination() {

    const totalCnt = users.total_count;
    const totalPages = Math.ceil(totalCnt / perPage);

    // Generate pagination pages
    paginationElement.innerHTML = '';
    let dotCount = 0;
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item mb-1 ${page == i ? 'active' : ''}`;
        if (i == 1) {

            li.id = "prevPage";
        }
        else if (i == totalPages) {

            li.id = "nextPage";

        }
        else {
            if (totalPages > 10) {
                if ((i > (page + 2) || i < (page - 2)) && i < (totalPages - 1)) {
                    if (dotCount < 3) {
                        li.innerHTML = `<span class="page-link"  >.</span>`;
                        paginationElement.appendChild(li);
                        dotCount++;
                    }
                    continue;
                }


            }
        }

        li.innerHTML = `<a class="page-link cursor-pointer"  href="javascript:void(0)" onclick="changePage(${i})" >${i}</a>`;
        paginationElement.appendChild(li);

    }


}

function changePage(pageDelta) {
    // clean query search bar

    page = pageDelta;
    displayUsers();
}

displayUsers();


function copyMyId() {
    document.getElementById('username').value = "piyush";
    displayUsers();
}



function setPerPage(select) {
    page = 1;
    perPage = select.value;
    displayUsers();
}

usernameInput.addEventListener('input', function () {
    clearTimeout(typingTimer2);
    typingTimer2 = setTimeout(function () {
        displayUsers();
    }, 1500);
});




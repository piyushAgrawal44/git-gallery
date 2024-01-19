const toastLiveExample = document.getElementById('error-toast');
const repoListElement = document.getElementById('repoList');
const paginationElement = document.getElementById('pagination');
const noUserElement = document.getElementById('no-user-found');
const detailsElement = document.getElementById("details");
const loaderElement = document.getElementById("loader");
const queryInput = document.getElementById('query');
const usernameInput = document.getElementById('username')
let typingTimer1;
let typingTimer2;

let reposReference = [];
let repos = [];

let page = 1;
const perPage = 10;

function fetchUserDetails() {
    
    detailsElement.classList.add("d-none");
    noUserElement.classList.add("d-none");
    loaderElement.classList.remove("d-none");

    const username = document.getElementById('username').value.trim();
    fetch(`https://api.github.com/users/${username}`).then(res => res.json()).then(async (data) => {

        if (data.message === 'Not Found') {
            document.getElementById("error-toast-message").innerText = "Username is invalid";
            const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
            toastBootstrap.show();
            loaderElement.classList.add("d-none");
            detailsElement.classList.add("d-none");
            noUserElement.classList.remove("d-none");
            
        }
        else {
            document.getElementById('avatarImg').src = data.avatar_url;
            document.getElementById('name').innerText = data.name ?? data.login;
            document.getElementById('bio').innerText = data.bio ?? '';
            document.getElementById('followers').innerText = data.followers ?? 0;
            document.getElementById('total_repos').innerText = data.public_repos ?? 0;
            document.getElementById('emailid').innerHTML = `<a data-bs-toggle="tooltip" data-bs-placement="top" title="${data.email}" class="text-decoration-none" href="mailto:${data.email}">${data.email ?? "NA"}<a/>`;
            document.getElementById('githuburl').innerHTML = `<a data-bs-toggle="tooltip" data-bs-placement="top" title="${data.html_url}" class="text-decoration-none" href="${data.html_url}">@${data.login}<a/>`;
            document.getElementById('location').innerText = data.location ?? 'NA';
            // clean query search bar
            queryInput.value = "";
            // fetch repo
            await displayRepos();
            // hide loader
            detailsElement.classList.remove("d-none");
            loaderElement.classList.add("d-none");
        }
    });
}

async function fetchRepos() {
    const username = document.getElementById('username').value.trim();

    const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}`);
    repos = await response.json();
    reposReference = repos;

}

async function totalRepos() {
    const username = document.getElementById('username').value.trim();

    const response = await fetch(`https://api.github.com/users/${username}`);
    const userData = await response.json();

    if (response.ok && userData.message != 'Not Found') {
        return userData.public_repos;
    } else {
        document.getElementById("error-toast-message").innerText = "Please enter valid username to search";
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
        toastBootstrap.show()
        return 0;
    }


}

async function displayRepos() {
    const username = document.getElementById('username').value.trim();

    if (username == "") {
        document.getElementById("error-toast-message").innerText = "Please enter valid username to search";
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
        toastBootstrap.show()
        return 0;
    }
    else {

        await fetchRepos();

        repoListElement.innerHTML = '';

        let htmlStr = "";
        repos.forEach(repo => {
            htmlStr += `
          <div class="repo" style="font-size: 12px;">
            <h6 class="text-overflow-ellipsis" data-bs-toggle="tooltip" data-bs-placement="top" title="${repo.name}">${repo.name}</h6>
            <span>${repo.description ?? ''}</span>

            <div class="mt-2">
              <a href="${repo.html_url}" target="_blank" class="text-decoration-none"><i class="bi bi-link-45deg"></i>
                link</a>
            </div>
        `;

            if (repo.topics.length > 0) {
                htmlStr += `<div class="mt-2 d-flex gap-2 w-auto hide-scrollbar" style="overflow-x: auto;">`;

                repo.topics.map(topic => {
                    htmlStr += `<span class="p-1 text-center rounded-pill border border-1 border-white" style="min-width:fit-content">${topic}</span>`;
                });

                htmlStr += `
            </div>
        `;
            }
            htmlStr += `</div>`;
        });

        if (repos.length == 0) {
            htmlStr += "<span>No repo found...</span>"
        }


        repoListElement.innerHTML = htmlStr;



        updatePagination();
    }

}

async function updatePagination() {

    const totalCnt = await totalRepos();
    const totalPages = Math.ceil(totalCnt / perPage);

    // Generate pagination pages
    paginationElement.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item mb-1 ${page == i ? 'active' : ''}`;
        if (i == 1) {

            li.id = "prevPage";
        }
        else if (i == totalPages) {

            li.id = "nextPage";

        }

        li.innerHTML = `<a class="page-link" href="#repoList" onclick="changePage(${i})" >${i}</a>`;
        paginationElement.appendChild(li);

    }

    // const prevPageElement = document.getElementById('prevPage');
    // const nextPageElement = document.getElementById('nextPage');

    // // Enable or disable the "Previous" button based on whether there's a previous page
    // prevPageElement.classList.toggle('disabled', page === 1);

    // // Enable or disable the "Next" button based on whether there's a next page
    // nextPageElement.classList.toggle('disabled', page == totalPages); // GitHub API limitation
}

function changePage(pageDelta) {
    // clean query search bar
    queryInput.value = "";
    page = pageDelta;
    displayRepos();
}

fetchUserDetails();


function copyMyId() {
    document.getElementById('username').value = "piyushAgrawal44";
    fetchUserDetails();
}



async function searchUserRepositories() {
    const query = queryInput.value.trim();
    const username = document.getElementById('username').value.trim();

    if (query != '') {


        const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}+user:${encodeURIComponent(username)}`);
        const searchData = await response.json();

        if (response.ok) {
            repos = searchData.items; // Returns an array of matching repositories
        } else {
            console.log(`Failed to perform repository search: ${searchData.message}`);
            document.getElementById("error-toast-message").innerText = "Failed to perform repository search";
            const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
            toastBootstrap.show();
            repos = reposReference;
        }
    }
    else {
        repos = reposReference;
    }

    repoListElement.innerHTML = '';

    let htmlStr = "";
    repos.forEach(repo => {
        htmlStr += `
          <div class="repo" style="font-size: 12px;">
            <h6 class="text-overflow-ellipsis" data-bs-toggle="tooltip" data-bs-placement="top" title="${repo.name}">${repo.name}</h6>
            <span>${repo.description ?? ''}</span>

            <div class="mt-2">
              <a href="${repo.html_url}" target="_blank" class="text-decoration-none"><i class="bi bi-link-45deg"></i>
                link</a>
            </div>
        `;

        if (repo.topics.length > 0) {
            htmlStr += `<div class="mt-2 d-flex gap-2 w-auto" style="overflow-x: auto;">`;

            repo.topics.map(topic => {
                htmlStr += `<span class="p-1 rounded-pill border border-1 border-white">${topic}</span>`;
            });

            htmlStr += `
            </div>
        `;
        }
        htmlStr += `</div>`;
    });

    if (repos.length == 0) {
        htmlStr += "<span>No repo found...</span>"
    }


    repoListElement.innerHTML = htmlStr;
}


usernameInput.addEventListener('input', function () {
    clearTimeout(typingTimer2);
    typingTimer2 = setTimeout(function () {
        fetchUserDetails();
    }, 1500);
});

queryInput.addEventListener('input', function () {
    clearTimeout(typingTimer1);
    typingTimer1 = setTimeout(function () {
        searchUserRepositories();
    }, 800);
});




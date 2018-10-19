import {fromEvent} from "rxjs";
import {tap, debounceTime, map, pluck, filter, mergeAll} from "rxjs/operators";
import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.css';

const searchBox = document.getElementById('searchBox') as HTMLInputElement;
const searchQuery$ = fromEvent(searchBox, 'keyup')
    .pipe(
        debounceTime(1000),
        pluck('target', 'value'),
        filter(value => value != '')
        // TODO protect from keyup that results in the same value as before
    )
;

// TODO a "loading" indicator that works independently would be nice...

const liveSearch$ = searchQuery$.pipe(
    tap(q => console.log(`Query: ${q}`)),
    map(q => searchRepository(<string>q)),
    mergeAll(),
    tap(result => console.log(result)),
    tap(result => render(result))
);

liveSearch$.subscribe();

type SearchRepoResult = {
    items: {
        full_name: string,
        description: string
        html_url: string,
        forks: number,
        score: number,
        owner: {
            login: string,
            avatar_url: string
        }
    }[]
};

const output = document.getElementById('output') as HTMLDivElement;

// https://developer.github.com/v3/search/#search-repositories
function searchRepository(query: string): Promise<SearchRepoResult> {
    const url = new URL('https://api.github.com/search/repositories');
    url.searchParams.append('q', query);
    return fetch(url.toString()).then(response => {
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return response.json();
    });
}

function render(result: SearchRepoResult) {
    const ul = document.createElement('ul');
    ul.className = 'list-unstyled';
    for (let i = 0, l = result.items.length; i < l && i < 10; i++) {
        let item = result.items[i];
        let li = document.createElement('li');
        li.innerHTML = `
            <div class="container">
                <div class="row">
                    <h3>${item.full_name}</h3>
                </div>
                <div class="row">
                    <div class="col-sm-2">
                        <img src="${item.owner.avatar_url}" alt="${item.owner.login}">
                    </div>
                    <div class="col-sm-10">
                        <p>${item.description}</p>
                        <ul class="list-inline">
                            <li class="list-inline-item">Score: ${item.score}</li>
                            <li class="list-inline-item">Forks: ${item.forks}</li>
                            <li class="list-inline-item"><a href="${item.html_url}">${item.html_url}</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        ul.appendChild(li);
    }
    output.innerHTML = '';
    output.appendChild(ul);
}

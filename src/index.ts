import {fromEvent} from "rxjs";
import {tap, debounceTime, map, pluck, filter} from "rxjs/operators";

const searchBox = document.getElementById('searchBox') as HTMLInputElement;
const searchQuery$ = fromEvent(searchBox, 'keyup')
    .pipe(
        debounceTime(1000),
        pluck('target', 'value'),
        filter(value => value != '')
    )
;

// TODO a "loading" indicator that works independently would be nice...

const liveSearch$ = searchQuery$.pipe(
    tap(q=> console.log(`Query: ${q}`)),
    map(q => searchRepository(<string>q))
    // TODO
);

liveSearch$.subscribe();

function searchRepository(query: string): Promise<Response> {
    // https://developer.github.com/v3/search/#search-repositories
    // TODO throttle no more than 30 per minute
    const url = new URL('https://api.github.com/search/repositories');
    url.searchParams.append('q', query);
    return fetch(url.toString());
}

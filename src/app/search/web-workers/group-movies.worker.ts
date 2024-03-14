import { DoWork, runWorker } from 'observable-webworker';
import { group, sort } from 'radash'
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Movie, MoviesGroup } from '../types/movie';

export class GroupMoviesWorker implements DoWork<Movie[], MoviesGroup[]> {

    public work(movies: Observable<Movie[]>): Observable<MoviesGroup[]> {
        return movies.pipe(
            map((movies) => {
                const groupedMoviesMap = group(movies, ({ year }) => year);
                const groupedMovies = Object.keys(groupedMoviesMap).map((year) => ({ year, movies: groupedMoviesMap[year] ?? [] }));

                return sort(groupedMovies, ({ year }) => -parseInt(year));
            })
        );
    }
}

runWorker(GroupMoviesWorker);

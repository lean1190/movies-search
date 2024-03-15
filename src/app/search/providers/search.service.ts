import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { fromWorker } from 'observable-webworker';
import { forkJoin, map, Observable, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Movie, MoviesGroup, RatingSource } from '../types/movie';

@Injectable()
export class SearchService {

    private readonly apiBaseUrl = `${environment.omdbApiUrl}apikey=${environment.omdbApiKey}&type=movie`;

    constructor(private httpClient: HttpClient) {}

    public searchMovies(title: string): Observable<MoviesGroup[]> {
        const onlyFirstPage = 'page=1';

        return this.httpClient.get<SearchResponse>(`${this.apiBaseUrl}&s=${title}&${onlyFirstPage}`).pipe(
            switchMap(
                (response) => this.getMoviesDetailsFromResponse(response).pipe(
                    (movies) => this.getGroupedMovies(movies)
                )
            )
        );
    }

    public getMovie(imdbId: string): Observable<Movie> {
        return this.httpClient.get<DetailResponse>(`${this.apiBaseUrl}&i=${imdbId}`).pipe(
            map((details) => ({
                title: details.Title,
                year: details.Year,
                posterUrl: details.Poster,
                imdbId: details.imdbID,
                rating: details.Ratings.find((rating) => rating.Source === RatingSource.Imdb)?.Value as string,
                awards: details.Awards
            }))
        );
    }

    private getMoviesDetailsFromResponse(response: SearchResponse): Observable<Movie[]> {
        return forkJoin((response.Search ?? []).map((movie) => this.getMovie(movie.imdbID)));
    }

    private getGroupedMovies(movies: Observable<Movie[]>): Observable<MoviesGroup[]> {
        return fromWorker<Movie[], MoviesGroup[]>(() => new Worker(
            new URL('../web-workers/group-movies.worker', import.meta.url),
            { type: 'module' }
        ), movies);
    }
}

interface SearchResponse {
  Search: SearchMovieResponse[];
  totalResults: string;
  Response: string;
}

interface SearchMovieResponse {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

interface DetailResponse {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: {
    Source: RatingSource;
    Value: string;
  }[],
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
}

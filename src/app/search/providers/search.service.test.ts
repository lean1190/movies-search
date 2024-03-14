import { HttpClient } from '@angular/common/http';
import { createServiceFactory, createSpyObject, SpectatorService, SpyObject } from '@ngneat/spectator/jest';
import * as observableWebWorker from 'observable-webworker';
import { of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { takeValues } from '../../../lib/observable';
import { RatingSource } from '../types/movie';
import { SearchService } from './search.service';

describe('SearchService', () => {

    let searchService: SearchService;
    let httpClientMock: SpyObject<HttpClient>;

    let spectator: SpectatorService<SearchService>;

    const createService = createServiceFactory(SearchService);

    beforeEach(() => {
        httpClientMock = createSpyObject(HttpClient);

        spectator = createService({
            providers: [{ provide: HttpClient, useValue: httpClientMock }]
        });

        searchService = spectator.service;
    });

    describe('searchMovies', () => {
        const search = 'search';
        const moviesGroups = [
            {
                year: '2020',
                movies: [
                    {
                        title: 'title1',
                        year: 'year1',
                        posterUrl: 'poster1',
                        imdbId: 'id1',
                        rating: '10/10',
                        awards: 'award1',
                    },
                    {
                        title: 'title2',
                        year: 'year2',
                        posterUrl: 'poster2',
                        imdbId: 'id2',
                        rating: '10/10',
                        awards: 'award2',
                    },
                ],
            },
            {
                year: '2019',
                movies: [
                    {
                        title: 'title3',
                        year: 'year3',
                        posterUrl: 'poster3',
                        imdbId: 'id3',
                        rating: '10/10',
                        awards: 'award3',
                    },
                ],
            },
        ];

        let workerSpy: jest.SpyInstance;
        let httpGetSpy: jest.SpyInstance;
        let getMovieSpy: jest.SpyInstance;

        beforeEach(() => {
            workerSpy = jest.spyOn(observableWebWorker, 'fromWorker').mockReturnValue(of(moviesGroups));
            httpGetSpy = httpClientMock.get.mockReturnValue(
                of({
                    Search: [
                        { Title: 'title1', Year: 'year1', imdbID: 'id1' },
                        { Title: 'title2', Year: 'year2', imdbID: 'id2' },
                        { Title: 'title3', Year: 'year3', imdbID: 'id3' },
                    ],
                })
            );
            getMovieSpy = jest.spyOn(searchService, 'getMovie').mockReturnValue(
                of({
                    title: 'title1',
                    year: 'year1',
                    posterUrl: 'poster1',
                    imdbId: 'id1',
                    rating: '10/10',
                    awards: 'award1',
                })
            );
        });

        it('should return movies', async () => {
            const [movies] = await takeValues(searchService.searchMovies(search));

            const expectedUrl = `${environment.omdbApiUrl}apikey=${environment.omdbApiKey}&type=movie&s=${search}&page=1`;
            expect(movies).toEqual(moviesGroups);
            expect(httpGetSpy).toHaveBeenCalledWith(expectedUrl);
            expect(getMovieSpy).toHaveBeenCalledWith('id1');
            expect(getMovieSpy).toHaveBeenCalledWith('id2');
            expect(getMovieSpy).toHaveBeenCalledWith('id3');
            expect(workerSpy).toHaveBeenCalledWith(
                () =>
                    new Worker(
                        new URL('../web-workers/group-movies.worker', import.meta.url),
                        { type: 'module' }
                    )
            );
        });

        it('should return an error if the api errors', async () => {
            const expectedError = new Error('error');
            httpGetSpy.mockReturnValue(throwError(() => expectedError));

            await expect(takeValues(searchService.searchMovies(search))).rejects.toThrow(expectedError);
        });
    });

    describe('getMovie', () => {

        const movieId = 'movieId';

        let httpGetSpy: jest.SpyInstance;

        beforeEach(() => {
            httpGetSpy = httpClientMock.get.mockReturnValue(
                of({
                    Title: 'title1',
                    Year: 'year1',
                    Poster: 'poster1',
                    imdbID: 'id1',
                    Ratings: [{
                        Source: RatingSource.Imdb,
                        Value: '10/10'
                    }],
                    Awards: 'award1'
                })
            );
        })

        it('should return a movie', async () => {
            const expectedMovie = {
                title: 'title1',
                year: 'year1',
                posterUrl: 'poster1',
                imdbId: 'id1',
                rating: '10/10',
                awards: 'award1',
            };

            const [movie] = await takeValues(searchService.getMovie(movieId));

            expect(movie).toEqual(expectedMovie);
        });

        it('should return an error if the api errors', async () => {
            const expectedError = new Error('error');
            httpGetSpy.mockReturnValue(throwError(() => expectedError));

            await expect(takeValues(searchService.getMovie(movieId))).rejects.toThrow(expectedError);
        });
    });
});

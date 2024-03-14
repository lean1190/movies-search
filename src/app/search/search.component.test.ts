import { ReactiveFormsModule } from '@angular/forms';
import { createComponentFactory, createSpyObject, Spectator, SpyObject } from '@ngneat/spectator/jest';
import { of } from 'rxjs';

import { SearchService } from './providers/search.service';
import { SearchComponent } from './search.component';

describe('SearchComponent', () => {
    const searchInputSelector = '[data-test-hook="search-input"]';

    let spectator: Spectator<SearchComponent>;
    let component: SearchComponent;

    let searchServiceMock: SpyObject<SearchService>;

    const createComponent = createComponentFactory({
        component: SearchComponent,
        imports: [ReactiveFormsModule],
        shallow: true
    });

    beforeEach(async () => {
        searchServiceMock = createSpyObject(SearchService);

        spectator = createComponent({
            providers: [
                { provide: SearchService, useValue: searchServiceMock }
            ]
        });

        component = spectator.component;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display movies after search', async () => {
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

        searchServiceMock.searchMovies.and.returnValue(of(moviesGroups));
        spectator.typeInElement('harry potter', searchInputSelector)

        const results = spectator.queryAll('.search-results-group');

        expect(results.length).toBe(2);
    });
});

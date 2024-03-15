import { AsyncPipe, NgClass, NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ImageModule } from 'primeng/image';
import { InputTextModule } from 'primeng/inputtext';
import { debounceTime, distinctUntilChanged, Observable, switchMap } from 'rxjs';

import { SearchService } from './providers/search.service';
import { MoviesGroup } from './types/movie';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, NgFor, NgClass, AsyncPipe, CardModule, InputTextModule, ImageModule],
    providers: [SearchService]
})
export class SearchComponent {

    public searchForm = this.formBuilder.group({
        title: new FormControl('', Validators.required)
    });

    public movies: Observable<MoviesGroup[]> = this.searchForm.controls.title.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((title) => this.searchService.searchMovies(title ?? ''))
    );

    constructor(
        private formBuilder: FormBuilder,
        private searchService: SearchService
    ) {}
}

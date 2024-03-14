import { lastValueFrom, Observable, take, toArray } from 'rxjs';

export function takeValues<T>(
    observable: Observable<T>,
    count: number = 1,
): Promise<T[]> {
    return lastValueFrom(observable.pipe(take(count), toArray()));
}

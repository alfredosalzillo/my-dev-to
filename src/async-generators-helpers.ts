export const collect = async <T, >(iterator: AsyncIterable<T>): Promise<T[]> => {
  const arr = [];
  for await (const item of iterator) {
    arr.push(item);
  }
  return arr;
};


export const until = async function* <T, >(iterator: AsyncIterable<T>, filter: (t: T) => boolean): AsyncIterable<T> {
  for await (const item of iterator) {
    if (filter(item)) yield item;
    else return;
  }
};



export class AsyncStream<T> {
  constructor(public readonly iterator: AsyncIterable<T>) {}


  public until(filter: (t: T) => boolean): AsyncStream<T> {
    return new AsyncStream(until(this.iterator, filter));
  }

  public collect(): Promise<T[]> {
    return collect(this.iterator);
  }

  public static of<T>(iterator: AsyncIterable<T>): AsyncStream<T> {
    return new AsyncStream(iterator);
  }
}

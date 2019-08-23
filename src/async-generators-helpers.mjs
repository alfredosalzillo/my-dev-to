export const waitAll = async (what) => {
  const arr = [];
  for await (const item of what) {
    arr.push(item);
  }
  return arr;
};

export const reduce = async (iterator, reducer, defaultAcc) => {
  let acc = defaultAcc;
  for await (const value of iterator) {
    acc = reducer(acc, value);
  }
  return acc;
};

export const filter = async function * (iterator, condition) {
  for await (const value of iterator) {
    if (condition(value)) yield value;
  }
};

export const until = async function * (iterator, condition) {
  for await (const value of iterator) {
    if (condition(value)) yield value;
    else break;
  }
};

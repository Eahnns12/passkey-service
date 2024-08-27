const [result, error] = await asyncWrapper(() => {});

async function asyncWrapper(callback) {
  try {
    // ...
  } catch (error) {}
}

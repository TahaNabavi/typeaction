const consoleError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes(
        "The current testing environment is not configured to support act"
      )
    ) {
      return;
    }
    consoleError(...args);
  };
});

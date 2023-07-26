import ReactGA from "react-ga";

export const initGA = () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const id = import.meta.env.VITE_GA;
  if (process.env.NODE_ENV === "production") {
    console.log("starting GA…");

    ReactGA.initialize(id as string);
    ReactGA.pageview(window.location.pathname + window.location.search);
  }
};

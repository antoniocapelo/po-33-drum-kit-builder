import ReactGA from "react-ga";

export const initGA = () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const id = import.meta.env.VITE_GA;
  if (process.env.NODE_ENV === "production") {
    ReactGA.initialize(id as string);
  }
};

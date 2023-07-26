import ReactGA from "react-ga4";

export const initGA = () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const id = import.meta.env.VITE_GA as string;
  if (id && process.env.NODE_ENV === "production") {
    ReactGA.initialize([
      {
        trackingId: id,
      },
    ]);

    // Send pageview with a custom path
    ReactGA.send({
      hitType: "pageview",
      page: `${window.location.pathname}${window.location.search}`,
      title: "PO-33 util",
    });
  }
};

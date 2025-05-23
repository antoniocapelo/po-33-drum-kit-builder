import { useEffect, useRef } from "react";
import "./About.css";

export const About = ({ onDismiss }: { onDismiss: () => void }) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    btnRef.current?.focus();
  }, []);
  return (
    <div className="about">
      <div className="overlay"></div>
      <div className="content">
        <p>
          Web utility for building drum kits for the amazing Teenage
          Engineering{" "}
          <a
            href="https://teenage.engineering/store/po-33/"
            target="_blank"
            rel="noreferrer noopener"
          >
            PO-33 sampler
          </a>
          .
        </p>
        <p>
          You can <strong>add</strong> your own samples by dragging-and-dropping
          them on pads or by clicking them. Then, you can <strong>tweak</strong>{" "}
          their volume, pitch, and add some basic effect via the knobs. You can even "merge" them by dragging
          one over the other.
        </p>
        <p>
          Afterwards, just press "play" and sample into a drum slot of your
          PO-33 or press "save" to get a .wav version of the drum kit for future
          usages.
        </p>
        <p>
          To <strong>delete</strong> samples, drag the pad to the display. To{" "}
          <strong>stop</strong> all samples from playing, press the Escape key
          or click the display.
        </p>
      </div>
      <button tabIndex={0} onClick={onDismiss}
        ref={btnRef}
      >
        <svg
          height="12px"
          id="Layer_1"
          version="1.1"
          viewBox="0 0 512 512"
          width="12px"
        >
          <path d="M443.6,387.1L312.4,255.4l131.5-130c5.4-5.4,5.4-14.2,0-19.6l-37.4-37.6c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4  L256,197.8L124.9,68.3c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4L68,105.9c-5.4,5.4-5.4,14.2,0,19.6l131.5,130L68.4,387.1  c-2.6,2.6-4.1,6.1-4.1,9.8c0,3.7,1.4,7.2,4.1,9.8l37.4,37.6c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1L256,313.1l130.7,131.1  c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1l37.4-37.6c2.6-2.6,4.1-6.1,4.1-9.8C447.7,393.2,446.2,389.7,443.6,387.1z" />
        </svg>
      </button>
    </div>
  );
};

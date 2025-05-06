/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import useKeypress from "react-use-keypress";
import CookieConsent, {
  Cookies,
  getCookieConsentValue,
} from "react-cookie-consent";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { PrimeReactProvider } from "primereact/api";
//theme
import "primereact/resources/themes/lara-light-indigo/theme.css";

//core
import "primereact/resources/primereact.min.css";

import { useEffect, useState } from "react";
import { ToneAudioBuffer } from "tone";
import "./App.css";
import { About } from "./components/About/About";
import { Display } from "./components/Display/Display";
import { PitchKnob } from "./components/PitchKnob/PitchKnob";
import { Sample } from "./components/Sample/Sample";
import { VolumeKnob } from "./components/VolumeKnob/VolumeKnob";
import { initGA } from "./initiGA";
import { useExperienceState } from "./stores/experience-store";
import { useSamplerStore } from "./stores/samplers-store";
import { EffectKnob } from "./components/EffectKnob/EffectKnob";

export interface SamplesMap {
  [note: string]: ToneAudioBuffer | AudioBuffer | string;
  [midi: number]: ToneAudioBuffer | AudioBuffer | string;
}

function App() {
  const [showAbout, setShowAbout] = useState(false);
  const copyPad = useSamplerStore((state) => state.copyPad);
  const removeSampler = useSamplerStore((state) => state.removeSampler);
  const playAll = useSamplerStore((state) => state.playAll);
  const saveAll = useSamplerStore((state) => state.saveAll);
  const isBusy = useExperienceState((state) => state.state !== "idle");
  const setIsExporting = useExperienceState((state) => state.setIsExporting);
  const setIsPlaying = useExperienceState((state) => state.setIsPlaying);
  const setIsIdle = useExperienceState((state) => state.setIsIdle);
  const mergePads = useSamplerStore((state) => state.mergePads);
  const stopAll = useSamplerStore().stopAll;
  const setCurrentPad = useExperienceState().setCurrentPad;
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  const sensors = useSensors(pointerSensor);

  useEffect(() => {
    const isConsent = getCookieConsentValue();
    if (isConsent === "true") {
      handleAcceptCookie();
    }
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  useKeypress("Escape", (e: KeyboardEvent) => {
    if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) {
      return;
    }
    stopAll();
  });

  const handleAcceptCookie = () => {
    initGA();
  };

  const handleDeclineCookie = () => {
    //remove google analytics cookies
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    Cookies.remove("_ga");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    Cookies.remove("_gat");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    Cookies.remove("_gid");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (
      over &&
      over.data.current?.padNumber !== active?.data?.current?.padNumber
    ) {
      // clearing sample
      if (over.data.current?.display) {
        removeSampler(active?.data.current?.padNumber as number);
        return;
      }
      // destiny is empty
      if (active.data.current?.pad && !over.data.current?.pad) {
        copyPad(
          active.data.current?.padNumber as number,
          over.data.current?.padNumber as number
        );
      } else if (active.data.current?.pad && over.data.current?.pad) {
        // merge samples
        mergePads(
          active.data.current!.padNumber as number,
          over.data.current!.padNumber as number
        );
        setCurrentPad(over.data.current.padNumber as number);
      }
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <PrimeReactProvider>
        <main>
          <Display />
          {showAbout && <About onDismiss={() => setShowAbout(false)} />}
          <div className="effects">
            <EffectKnob effect="bitCrusher" label="BitC" min={0} max={100} />
            <EffectKnob effect="distortion" label="Dist" min={0} max={100} />
            <EffectKnob effect="reverb" label="Rev" min={0} max={100} />
            <EffectKnob effect="feedbackDelay" label="Delay" min={0} max={100} />
            <div className="sample">
              <button className="abt" onClick={() => setShowAbout(true)}>About</button>
            </div>
          </div>
          <div className="row">

            <div className="pads">
              {Array.from(new Array(16)).map((_, idx) => (
                <Sample key={idx} number={idx + 1} />
              ))}
            </div>
            <div className="func2">
              <PitchKnob />
              <VolumeKnob />
              <button
                disabled={isBusy}
                title="Save drum kit to file"
                style={{ background: "#ddd" }}
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onClick={async () => {
                  setIsExporting();
                  try {
                    console.log('Exporting...');
                    await saveAll();
                    console.log('Done exporting.')
                  } catch (e) {
                    setIsIdle();
                  }
                  setIsIdle();
                }}
              >
                <svg
                  id="Layer_1"
                  version="1.1"
                  viewBox="0 0 30 30"
                  width="16px"
                  height="16px"
                >
                  <path d="M22,4h-2v6c0,0.552-0.448,1-1,1h-9c-0.552,0-1-0.448-1-1V4H6C4.895,4,4,4.895,4,6v18c0,1.105,0.895,2,2,2h18  c1.105,0,2-0.895,2-2V8L22,4z M22,24H8v-6c0-1.105,0.895-2,2-2h10c1.105,0,2,0.895,2,2V24z" />
                  <rect height="5" width="2" x="16" y="4" />
                </svg>
              </button>
              <button
                title="Play whole drum kit"
                style={{ background: "#ddd" }}
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onClick={async () => {
                  setIsPlaying();
                  await playAll();
                  setIsIdle();
                }}
              >
                <svg
                  version="1.1"
                  id="Layer_1"
                  xmlns="http://www.w3.org/2000/svg"
                  y="0px"
                  viewBox="0 0 92.2 122.88"
                  className="play"
                  width="12px"
                  height="12px"
                >
                  <g>
                    <polygon points="92.2,60.97 0,122.88 0,0 92.2,60.97" />
                  </g>
                </svg>
              </button>
            </div>
          </div>
        </main>
        <div className="descs">
          <p className="desc">
            Like it? {" "}
            <a href="https://ko-fi.com/capelo" target="_blank">
              Buy me a coffee!
            </a>
          </p>
          <p className="desc">
            made by{" "}
            <a href="https://capelo.me" target="_blank">
              Capelo
            </a>
          </p>
        </div>


        <CookieConsent
          enableDeclineButton
          onAccept={handleAcceptCookie}
          onDecline={handleDeclineCookie}
          containerClasses="cookie msg"
          buttonText="Agree"
          declineButtonText="No thanks"
          buttonClasses="btn"
          buttonWrapperClasses="btns"
        >
          <div className="cookie-message">
            PO-33-util uses cookies to deliver and enhance the quality of its
            services and to analyze traffic. If you agree, cookies are also used
            to serve advertising and to personalize the content and
            advertisements that you see.{" "}
            <p style={{ margin: 0 }}>
              <a
                href="https://policies.google.com/technologies/cookies"
                target="_blank"
              >
                Learn more
              </a>
            </p>
          </div>
        </CookieConsent>
      </PrimeReactProvider>
    </DndContext>
  );
}

export default App;

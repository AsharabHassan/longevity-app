# Report protocol videos

The report's existing `ProtocolMatch` component now uses the final label-free films:

- Fatigue and brain fog / Clear Focus → `/videos/clear-focus.mp4` (Clear Focus Remotion v2).
- Metabolic Momentum → `/videos/metabolic-momentum.mp4` (Dr Ahmad Remotion v3).

Sources are the exports in `D:/June Project/wellness-video-research/remotion-clear-focus/out`. Files were remuxed without re-encoding, with the MP4 index at the beginning for streaming. Posters come from each film at two seconds. Caption text is already burned into both films. No avatar labels were added.

The existing matching and qualification rules remain in place: a video appears inside its corresponding matched protocol card. No video is shown for protocols without an available film. Native controls, inline mobile playback, no autoplay and no video preloading keep control with the viewer. The portrait player is limited to 300px wide.

Validation: eight existing protocol tests passed; TypeScript and scoped ESLint passed. HTTP checks returned 200 with video/mp4 and 206 with the requested byte range. The actual report component loaded in a temporary local review route, but the in-app browser crashed on playback, so browser playback was not verified. The temporary route was removed. No deployment performed.

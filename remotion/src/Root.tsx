import React from 'react';
import {Composition} from 'remotion';
import {WebsiteRefresh} from './WebsiteRefresh';
import {DURATION, FPS} from './theme';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="WebsiteRefresh"
        component={WebsiteRefresh}
        durationInFrames={DURATION}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{
          variant: 'reel',
          showSafe: false,
          locale: 'en',
        }}
      />
      <Composition
        id="WebsiteRefreshSK"
        component={WebsiteRefresh}
        durationInFrames={DURATION}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{
          variant: 'reel',
          showSafe: false,
          locale: 'sk',
        }}
      />
      <Composition
        id="WebsiteRefreshSquare"
        component={WebsiteRefresh}
        durationInFrames={DURATION}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{
          variant: 'square',
          showSafe: false,
          locale: 'en',
        }}
      />
      <Composition
        id="WebsiteRefreshSquareSK"
        component={WebsiteRefresh}
        durationInFrames={DURATION}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{
          variant: 'square',
          showSafe: false,
          locale: 'sk',
        }}
      />
    </>
  );
};

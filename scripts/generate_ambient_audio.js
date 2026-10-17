import fs from 'fs';
import path from 'path';

// Helper to write a 16-bit PCM WAV file
function createWav(filename, durationSec, sampleRate, generator) {
  const numSamples = durationSec * sampleRate;
  const buffer = Buffer.alloc(44 + numSamples * 2);

  // RIFF identifier
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk1 size
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(sampleRate, 24); // sample rate
  buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.max(-1, Math.min(1, generator(t, durationSec)));
    const intSample = Math.floor(sample * 32767);
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  const outPath = path.resolve('public/audio', filename);
  fs.writeFileSync(outPath, buffer);
  console.log(`Created ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

const sampleRate = 22050;
const duration = 20; // 20-second seamless-ish loop

// 1. Suspense Dark Drone (D minor: 73.4Hz + 110Hz + 146.8Hz + slow low-pass modulation)
createWav('suspense_dark.wav', duration, sampleRate, (t, dur) => {
  const lfo = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.15 * t);
  const drone1 = Math.sin(2 * Math.PI * 73.41 * t) * 0.4;
  const drone2 = Math.sin(2 * Math.PI * 110.0 * t) * 0.25;
  const drone3 = Math.sin(2 * Math.PI * 146.83 * t) * (0.15 * lfo);
  const rumble = Math.sin(2 * Math.PI * 36.7 * t) * 0.2;
  const env = Math.sin((Math.PI * t) / dur); // smooth fade
  return (drone1 + drone2 + drone3 + rumble) * 0.7 * env;
});

// 2. Dramatic Cinematic Strings (Cm - Ab - Eb - Bb chord progression)
createWav('dramatic_strings.wav', duration, sampleRate, (t, dur) => {
  const chordTime = 5; // 4 chords in 20 sec
  const chordIdx = Math.floor(t / chordTime) % 4;
  const chords = [
    [130.81, 155.56, 196.00], // C minor
    [103.83, 130.81, 164.81], // Ab major
    [155.56, 196.00, 233.08], // Eb major
    [116.54, 146.83, 174.61], // Bb major
  ];
  const currentChord = chords[chordIdx];
  const chordPos = (t % chordTime) / chordTime;
  const chordEnv = Math.sin(Math.PI * chordPos);

  let val = 0;
  for (const f of currentChord) {
    val += Math.sin(2 * Math.PI * f * t) * 0.25;
    // slight vibrato
    val += Math.sin(2 * Math.PI * (f * 1.002) * t) * 0.15;
  }
  return val * chordEnv * 0.6;
});

// 3. Emotional Piano Ambient (gentle bell-like tones)
createWav('emotional_piano.wav', duration, sampleRate, (t, dur) => {
  const beatTime = 2.5;
  const beat = Math.floor(t / beatTime);
  const notes = [220.0, 261.63, 329.63, 392.0, 293.66, 349.23, 440.0, 329.63];
  const freq = notes[beat % notes.length];
  const noteT = t % beatTime;
  const noteEnv = Math.exp(-noteT * 2.2); // piano decay
  const fundamental = Math.sin(2 * Math.PI * freq * t) * 0.5;
  const harmonic = Math.sin(2 * Math.PI * freq * 2 * t) * 0.2;
  return (fundamental + harmonic) * noteEnv * 0.7;
});

// 4. Action Rhythmic Pulse
createWav('action_pulse.wav', duration, sampleRate, (t, dur) => {
  const beat = (t * 2) % 1; // 120 bpm
  const kickEnv = Math.exp(-beat * 15);
  const kickFreq = 120 * Math.exp(-beat * 25) + 45;
  const kick = Math.sin(2 * Math.PI * kickFreq * t) * kickEnv * 0.6;
  const bass = Math.sin(2 * Math.PI * 55 * t) * 0.3;
  const hihat = (Math.random() * 2 - 1) * Math.exp(-((t * 4) % 1) * 30) * 0.1;
  return (kick + bass + hihat) * 0.7;
});
